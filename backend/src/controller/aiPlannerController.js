const path = require('path');
const { spawn } = require('child_process');
const mealModel = require('../model/mealModel');

const aiPlannerController = {
  // POST /api/ai-planner/generate
  async generate(req, res, next) {
    try {
      const {
        event_type,
        eventType,
        pax,
        budget,
        taste_preference,
        tastePreference,
        date,
      } = req.body;

      const finalEventType = event_type || eventType || 'Rapat Kantor';
      const finalPax = Number(pax || 0);
      const finalBudget = Number(budget || 0);
      const finalTastePref = taste_preference || tastePreference || 'Semua';

      if (!finalPax || finalPax <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Jumlah peserta (pax) harus lebih besar dari 0.',
        });
      }

      if (!finalBudget || finalBudget <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Anggaran total harus lebih besar dari Rp 0.',
        });
      }

      // 1. Ambil semua menu yang aktif dari database
      const allMeals = await mealModel.getAll();
      const activeMeals = allMeals.filter((m) => m.is_available === 1 || m.is_available === true);

      if (!activeMeals || activeMeals.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Saat ini belum ada menu masakan yang aktif di dapur NutriMeal.',
        });
      }

      // 2. Siapkan payload JSON untuk Python Optimization Engine
      const payload = {
        event_type: finalEventType,
        pax: finalPax,
        budget: finalBudget,
        taste_preference: finalTastePref,
        date: date || null,
        meals: activeMeals,
      };

      // 3. Eksekusi skrip Python
      const scriptPath = path.join(__dirname, '..', 'ai', 'ai_planner.py');
      const pythonProcess = spawn('python', [scriptPath]);

      let stdoutData = '';
      let stderrData = '';

      pythonProcess.stdin.write(JSON.stringify(payload));
      pythonProcess.stdin.end();

      pythonProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0 && !stdoutData) {
          console.error('[AI Planner] Python process error:', stderrData);
          return res.status(500).json({
            success: false,
            message: 'Gagal menjalankan Python Optimization Engine: ' + stderrData,
          });
        }

        try {
          const result = JSON.parse(stdoutData);
          if (!result.success) {
            return res.status(422).json({
              success: false,
              message: result.message || 'Optimasi paket tidak menemukan solusi yang layak.',
            });
          }

          return res.status(200).json(result);
        } catch (parseErr) {
          console.error('[AI Planner] JSON Parse error:', parseErr, 'Raw output:', stdoutData);
          return res.status(500).json({
            success: false,
            message: 'Gagal menguraikan output dari AI Planner solver: ' + stdoutData,
          });
        }
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = aiPlannerController;
