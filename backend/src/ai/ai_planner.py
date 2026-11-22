#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NutriMeal AI Planner - Constraint-Based Optimization Engine
Powered by Google OR-Tools (CP-SAT Solver)
"""

import sys
import json
import math
from ortools.sat.python import cp_model

def solve_tier(meals, pax, budget, tier="hemat", event_type="Rapat Kantor"):
    """
    Solves constraint satisfaction / optimization problem using Google OR-Tools CP-SAT.
    tier: 'hemat' | 'seimbang' | 'premium'
    """
    if not meals or pax <= 0:
        return None

    model = cp_model.CpModel()
    n = len(meals)

    # Decision variables
    # x[i]: integer quantity of meal i
    # y[i]: boolean indicator whether meal i is included in the package
    x = [model.NewIntVar(0, min(pax, int(m.get("stock_quantity", 100))), f"x_{i}") for i, m in enumerate(meals)]
    y = [model.NewBoolVar(f"y_{i}") for i in range(n)]

    # Linking constraints: x[i] > 0 <=> y[i] == 1
    for i in range(n):
        model.Add(x[i] <= pax * y[i])
        model.Add(x[i] >= y[i])

    # Constraint 1: Exact total portions = pax
    model.Add(sum(x[i] for i in range(n)) == pax)

    # Constraint 2: Total cost <= budget
    model.Add(sum(meals[i]["effective_price"] * x[i] for i in range(n)) <= budget)

    # Constraint 3: Variety (prevent complete monotony)
    min_distinct = min(2 if pax >= 10 else 1, n)
    if tier == "seimbang" and n >= 3 and pax >= 15:
        min_distinct = min(3, n)
    model.Add(sum(y[i] for i in range(n)) >= min_distinct)

    # Constraint 4: Maximum single meal cap if pax is large enough
    if n >= 2 and pax >= 12:
        cap_ratio = 0.80 if tier == "hemat" else (0.65 if tier == "seimbang" else 0.70)
        max_cap = max(1, math.ceil(pax * cap_ratio))
        for i in range(n):
            model.Add(x[i] <= max_cap)

    # Objective function
    if tier == "hemat":
        # Minimize Total Cost
        model.Minimize(sum(meals[i]["effective_price"] * x[i] for i in range(n)))

    elif tier == "seimbang":
        # Multi-objective: Maximize Event/Health Score + Moderate Variety, while keeping price reasonable
        # Target balanced budget: ~70-85% of budget if feasible
        scores = []
        for i, m in enumerate(meals):
            sc = 100
            ev_tags = str(m.get("event_tags", "")).lower()
            if event_type.lower() in ev_tags:
                sc += 80
            cat = m.get("category", "")
            if cat in ["Ayam", "Ikan"]:
                sc += 40
            elif cat in ["Daging", "Seafood"]:
                sc += 30
            scores.append(sc)

        # Maximize score minus slight cost penalty
        model.Maximize(
            sum(scores[i] * x[i] for i in range(n)) * 10
            - sum(meals[i]["effective_price"] * x[i] for i in range(n))
        )

    else:  # 'premium'
        # Maximize Premium Ingredients, higher calories, and utilize the full available budget
        prem_scores = []
        for i, m in enumerate(meals):
            sc = 50
            cat = m.get("category", "")
            if cat in ["Daging", "Seafood"]:
                sc += 150
            elif cat in ["Ikan"]:
                sc += 90
            elif cat in ["Ayam"]:
                sc += 60
            ev_tags = str(m.get("event_tags", "")).lower()
            if event_type.lower() in ev_tags:
                sc += 40
            prem_scores.append(sc)

        # Maximize premium quality and budget utilization
        model.Maximize(
            sum(prem_scores[i] * x[i] for i in range(n)) * 100
            + sum(meals[i]["effective_price"] * x[i] for i in range(n))
        )

    # Solver configuration
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 3.0
    solver.parameters.num_workers = 1
    solver.parameters.log_search_progress = False

    status = solver.Solve(model)

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return None

    # Extract chosen solution
    selected_items = []
    total_cost = 0
    total_calories = 0

    for i, m in enumerate(meals):
        qty = int(solver.Value(x[i]))
        if qty > 0:
            item_cost = qty * m["effective_price"]
            total_cost += item_cost
            total_calories += qty * int(m.get("calories", 400))
            selected_items.append({
                "meal": m,
                "quantity": qty,
                "unit_price": m["effective_price"],
                "total_price": item_cost
            })

    selected_items.sort(key=lambda it: it["quantity"], reverse=True)
    avg_calories = round(total_calories / pax) if pax > 0 else 0
    price_per_pax = round(total_cost / pax) if pax > 0 else 0

    return {
        "tier": tier,
        "total_cost": total_cost,
        "price_per_pax": price_per_pax,
        "budget_remaining": max(0, budget - total_cost),
        "avg_calories": avg_calories,
        "items": selected_items
    }

def format_idr(num):
    return f"Rp {num:,}".replace(",", ".")

def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input:
            print(json.dumps({"success": False, "message": "Input data JSON kosong."}))
            return

        payload = json.loads(raw_input)
        event_type = payload.get("event_type", "Rapat Kantor")
        pax = int(payload.get("pax", 1))
        budget = int(payload.get("budget", 0))
        taste_pref = payload.get("taste_preference", "Semua")
        raw_meals = payload.get("meals", [])

        if pax <= 0:
            print(json.dumps({"success": False, "message": "Jumlah peserta minimal 1 orang."}))
            return

        if budget <= 0:
            print(json.dumps({"success": False, "message": "Anggaran harus lebih dari Rp 0."}))
            return

        if not raw_meals:
            print(json.dumps({"success": False, "message": "Tidak ada data menu masakan yang aktif di database."}))
            return

        # 1. Filtering by availability, stock, and dietary/taste preference
        filtered_meals = []
        for m in raw_meals:
            is_avail = m.get("is_available")
            if is_avail is False or is_avail == 0:
                continue

            stock = int(m.get("stock_quantity", 100) or 100)
            if stock <= 0:
                continue

            spicy = m.get("spicy_level", "Tidak Pedas")
            is_veg = bool(m.get("is_vegetarian", False) or m.get("is_vegetarian") == 1)

            # Taste Preference Filter
            if taste_pref == "Tidak Pedas" and spicy == "Pedas":
                continue
            elif taste_pref == "Pedas" and spicy == "Tidak Pedas":
                continue
            elif taste_pref == "Vegetarian" and not is_veg:
                continue

            # Effective Price
            base_price = int(m.get("price", 0))
            disc = int(m.get("discount_percent", 0) or 0)
            eff_price = int(base_price * (1 - (disc / 100.0))) if disc > 0 else base_price
            m["effective_price"] = eff_price

            filtered_meals.append(m)

        if not filtered_meals:
            print(json.dumps({
                "success": False,
                "message": f"Tidak ditemukan menu yang sesuai dengan batasan rasa '{taste_pref}'. Silakan coba pilih preferensi rasa lain."
            }))
            return

        # 2. Check Feasibility (minimum cost to feed pax)
        min_unit_price = min(m["effective_price"] for m in filtered_meals)
        min_budget_required = min_unit_price * pax

        if budget < min_budget_required:
            print(json.dumps({
                "success": False,
                "message": f"Anggaran Rp {budget:,} tidak mencukupi. Estimasi biaya minimum untuk {pax} porsi adalah {format_idr(min_budget_required)}. Silakan sesuaikan porsi atau naikkan anggaran.".replace(",", ".")
            }))
            return

        # 3. Solve 3 Package Tiers
        res_hemat = solve_tier(filtered_meals, pax, budget, tier="hemat", event_type=event_type)
        res_seimbang = solve_tier(filtered_meals, pax, budget, tier="seimbang", event_type=event_type)
        res_premium = solve_tier(filtered_meals, pax, budget, tier="premium", event_type=event_type)

        packages = []
        if res_hemat and res_hemat["items"]:
            packages.append({
                "id": "pkg-hemat",
                "name": "Paket Hemat & Pas",
                "tier": "hemat",
                "tagline": "Pilihan paling ekonomis dengan gizi lengkap dan higienis",
                "badge": "Paling Hemat",
                "badge_color": "#10B981", # Emerald
                "total_cost": res_hemat["total_cost"],
                "price_per_pax": res_hemat["price_per_pax"],
                "budget_remaining": res_hemat["budget_remaining"],
                "avg_calories": res_hemat["avg_calories"],
                "items": res_hemat["items"]
            })

        if res_seimbang and res_seimbang["items"]:
            # If seimbang identical to hemat, check if cost or menu is distinct
            packages.append({
                "id": "pkg-seimbang",
                "name": "Paket Seimbang & Populer",
                "tier": "seimbang",
                "tagline": "Kombinasi ideal variasi menu, nutrisi seimbang, dan harga terjangkau",
                "badge": "Rekomendasi AI",
                "badge_color": "#0284C7", # Sky Blue
                "total_cost": res_seimbang["total_cost"],
                "price_per_pax": res_seimbang["price_per_pax"],
                "budget_remaining": res_seimbang["budget_remaining"],
                "avg_calories": res_seimbang["avg_calories"],
                "items": res_seimbang["items"]
            })

        if res_premium and res_premium["items"]:
            packages.append({
                "id": "pkg-premium",
                "name": "Paket Premium & Mewah",
                "tier": "premium",
                "tagline": "Memaksimalkan anggaran untuk sajian terbaik, kaya protein, dan mewah",
                "badge": "Maksimal & Mewah",
                "badge_color": "#D97706", # Amber
                "total_cost": res_premium["total_cost"],
                "price_per_pax": res_premium["price_per_pax"],
                "budget_remaining": res_premium["budget_remaining"],
                "avg_calories": res_premium["avg_calories"],
                "items": res_premium["items"]
            })

        if not packages:
            print(json.dumps({
                "success": False,
                "message": f"Tidak dapat menemukan kombinasi menu yang optimal untuk batasan ini. Coba tambahkan anggaran minimal {format_idr(min_budget_required)}."
            }))
            return

        output = {
            "success": True,
            "data": {
                "event_type": event_type,
                "pax": pax,
                "budget": budget,
                "taste_preference": taste_pref,
                "packages_count": len(packages),
                "packages": packages
            }
        }
        print(json.dumps(output))

    except Exception as e:
        print(json.dumps({
            "success": False,
            "message": f"Terjadi kesalahan pada AI Optimization Engine: {str(e)}"
        }))

if __name__ == "__main__":
    main()
