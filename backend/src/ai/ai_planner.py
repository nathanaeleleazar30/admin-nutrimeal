#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NutriMeal AI Planner - Constraint-Based Optimization Engine
Powered by Google OR-Tools (CP-SAT Solver) with Pure-Python Fallback Solver.
"""

import sys
import json
import math

# Force UTF-8 I/O for cross-platform reliability on Windows
if sys.version_info >= (3, 7):
    try:
        if sys.stdin and hasattr(sys.stdin, "reconfigure"):
            sys.stdin.reconfigure(encoding="utf-8")
        if sys.stdout and hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Optional import of OR-Tools CP-SAT
try:
    from ortools.sat.python import cp_model
    HAS_ORTOOLS = True
except Exception:
    cp_model = None
    HAS_ORTOOLS = False


def safe_int(val, default=0):
    """Safely converts input to integer with fallback default."""
    if val is None or val == "":
        return default
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return default


def safe_str(val, default=""):
    """Safely converts input to stripped string."""
    if val is None:
        return default
    return str(val).strip()


def format_idr(num):
    """Formats number as Indonesian Rupiah string (e.g. Rp 150.000)."""
    try:
        val = int(round(float(num)))
        return f"Rp {val:,}".replace(",", ".")
    except Exception:
        return f"Rp {num}"


def ensure_meal_attributes(meals):
    """Guarantees every meal dictionary has safe effective_price, calories, and stock_quantity."""
    for m in meals:
        eff_p = m.get("effective_price")
        if eff_p is None:
            base_p = safe_int(m.get("price"), 1000)
            disc = safe_int(m.get("discount_percent") or m.get("discountPercent"), 0)
            if disc > 0:
                eff_p = int(round(base_p * (1.0 - (disc / 100.0))))
            else:
                eff_p = base_p
        m["effective_price"] = max(100, safe_int(eff_p, 1000))
        m["stock_quantity"] = safe_int(m.get("stock_quantity"), 100)
        m["calories"] = safe_int(m.get("calories"), 400)


def compute_scores(meals, event_type="Rapat Kantor"):
    """
    Computes heuristic scores for balanced and premium package tiers.
    """
    event_lower = safe_str(event_type).lower()
    scores = []
    prem_scores = []

    for m in meals:
        cat = safe_str(m.get("category"))
        ev_tags = safe_str(m.get("event_tags")).lower()

        # Score for 'seimbang' tier (balanced nutrition + event relevance)
        sc = 100
        if event_lower and event_lower in ev_tags:
            sc += 80
        if cat in ["Ayam", "Ikan"]:
            sc += 40
        elif cat in ["Daging", "Seafood"]:
            sc += 30
        elif cat in ["Sayur", "Roti"]:
            sc += 20
        scores.append(sc)

        # Score for 'premium' tier (high-protein, luxury ingredients + event relevance)
        psc = 50
        if cat in ["Daging", "Seafood"]:
            psc += 150
        elif cat in ["Ikan"]:
            psc += 90
        elif cat in ["Ayam"]:
            psc += 60
        if event_lower and event_lower in ev_tags:
            psc += 40
        prem_scores.append(psc)

    return scores, prem_scores


def solve_tier_ortools(meals, pax, budget, tier="hemat", event_type="Rapat Kantor"):
    """
    Solves constraint satisfaction / optimization problem using Google OR-Tools CP-SAT.
    Applies constraint relaxation if strict variety or portion caps cause infeasibility.
    """
    if not HAS_ORTOOLS or not meals or pax <= 0:
        return None

    scores, prem_scores = compute_scores(meals, event_type)
    n = len(meals)

    # Relaxation levels:
    # 1. Strict variety and portion caps
    # 2. Relaxed portion cap, keep variety if possible
    # 3. Fully relaxed variety (min_distinct = 1) and no cap
    relaxation_levels = []
    if n >= 2 and pax >= 6:
        ideal_variety = 3 if (tier == "seimbang" and n >= 3 and pax >= 15) else 2
        relaxation_levels.append({
            "use_cap": (pax >= 10),
            "min_distinct": min(ideal_variety, n)
        })
        relaxation_levels.append({
            "use_cap": False,
            "min_distinct": min(2, n)
        })
    relaxation_levels.append({
        "use_cap": False,
        "min_distinct": 1
    })

    for level in relaxation_levels:
        model = cp_model.CpModel()

        # Decision variables:
        # x[i]: integer quantity of meal i
        # y[i]: boolean indicator whether meal i is included in the package
        x = [
            model.NewIntVar(0, min(pax, safe_int(m.get("stock_quantity"), 100)), f"x_{i}")
            for i, m in enumerate(meals)
        ]
        y = [model.NewBoolVar(f"y_{i}") for i in range(n)]

        # Linking constraints: x[i] > 0 <=> y[i] == 1
        for i in range(n):
            model.Add(x[i] <= pax * y[i])
            model.Add(x[i] >= y[i])

        # Constraint 1: Exact total portions = pax
        model.Add(sum(x[i] for i in range(n)) == pax)

        # Constraint 2: Total cost <= budget
        model.Add(sum(int(meals[i]["effective_price"]) * x[i] for i in range(n)) <= int(budget))

        # Constraint 3: Variety (prevent complete monotony if feasible)
        min_dist = level["min_distinct"]
        if min_dist > 1:
            model.Add(sum(y[i] for i in range(n)) >= min_dist)

        # Constraint 4: Maximum single meal cap if pax is large enough
        if level["use_cap"] and n >= 2 and pax >= 10:
            cap_ratio = 0.85 if tier == "hemat" else (0.65 if tier == "seimbang" else 0.75)
            max_cap = max(1, math.ceil(pax * cap_ratio))
            for i in range(n):
                model.Add(x[i] <= max_cap)

        # Objective function
        if tier == "hemat":
            # Minimize Total Cost
            model.Minimize(sum(int(meals[i]["effective_price"]) * x[i] for i in range(n)))

        elif tier == "seimbang":
            # Maximize Event/Health Score + Moderate Variety, while keeping price balanced
            model.Maximize(
                sum(scores[i] * 150 * x[i] for i in range(n))
                - sum(int(meals[i]["effective_price"]) * x[i] for i in range(n))
            )

        else:  # 'premium'
            # Maximize Premium Ingredients, higher protein, and utilize available budget
            model.Maximize(
                sum(prem_scores[i] * 200 * x[i] for i in range(n))
                + sum(int(meals[i]["effective_price"]) * x[i] for i in range(n))
            )

        # Solver configuration
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 2.0
        solver.parameters.num_workers = 1
        solver.parameters.log_search_progress = False

        status = solver.Solve(model)

        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            selected_items = []
            total_cost = 0
            total_calories = 0

            for i, m in enumerate(meals):
                qty = int(solver.Value(x[i]))
                if qty > 0:
                    unit_price = int(m["effective_price"])
                    item_cost = qty * unit_price
                    cal = safe_int(m.get("calories"), 400)
                    total_cost += item_cost
                    total_calories += qty * cal
                    selected_items.append({
                        "meal": m,
                        "quantity": qty,
                        "unit_price": unit_price,
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

    return None


def solve_tier_fallback(meals, pax, budget, tier="hemat", event_type="Rapat Kantor"):
    """
    Pure-Python Fallback Solver:
    Ensures the optimizer works reliably even when OR-Tools is not installed or fails.
    Uses bounded greedy heuristic with guaranteed budget feasibility checking.
    """
    if not meals or pax <= 0:
        return None

    scores, prem_scores = compute_scores(meals, event_type)
    n = len(meals)

    candidates = []
    for i, m in enumerate(meals):
        eff_p = int(m["effective_price"])
        stock = safe_int(m.get("stock_quantity"), 100)
        cal = safe_int(m.get("calories"), 400)
        candidates.append({
            "index": i,
            "meal": m,
            "price": eff_p,
            "stock": min(pax, stock),
            "calories": cal,
            "score": scores[i],
            "prem_score": prem_scores[i]
        })

    # Sort candidates based on tier objective
    if tier == "hemat":
        candidates.sort(key=lambda c: (c["price"], -c["score"]))
    elif tier == "seimbang":
        candidates.sort(key=lambda c: (c["score"] * 1000 / max(1, c["price"])), reverse=True)
    else:  # premium
        candidates.sort(key=lambda c: (c["prem_score"], c["price"]), reverse=True)

    cheapest_price = min(c["price"] for c in candidates)
    if cheapest_price * pax > budget:
        return None

    alloc = {i: 0 for i in range(n)}
    rem_pax = pax
    rem_budget = budget

    # Stage 1: Variety allocation if feasible
    if pax >= 8 and len(candidates) >= 2:
        target_distinct = 3 if (tier == "seimbang" and len(candidates) >= 3 and pax >= 15) else 2
        for c in candidates[:target_distinct]:
            idx = c["index"]
            p = c["price"]
            # Ensure order can still be completed with remaining budget
            if rem_pax > 1 and (rem_budget - p) >= (rem_pax - 1) * cheapest_price:
                if c["stock"] > alloc[idx]:
                    alloc[idx] += 1
                    rem_pax -= 1
                    rem_budget -= p

    # Stage 2: Main allocation respecting caps
    cap_ratio = 0.85 if tier == "hemat" else (0.65 if tier == "seimbang" else 0.75)
    max_cap = max(1, math.ceil(pax * cap_ratio)) if (len(candidates) >= 2 and pax >= 10) else pax

    for c in candidates:
        if rem_pax <= 0:
            break
        idx = c["index"]
        p = c["price"]
        max_allowed = min(rem_pax, c["stock"] - alloc[idx], max_cap - alloc[idx])
        if max_allowed > 0 and p > 0:
            if p == cheapest_price:
                take = min(max_allowed, rem_budget // p)
            else:
                margin = rem_budget - rem_pax * cheapest_price
                take = 0 if margin < 0 else min(max_allowed, margin // (p - cheapest_price))
            if take > 0:
                alloc[idx] += take
                rem_pax -= take
                rem_budget -= take * p

    # Stage 3: Fill remainder with cheapest available items
    if rem_pax > 0:
        cheapest_first = sorted(candidates, key=lambda c: c["price"])
        for c in cheapest_first:
            if rem_pax <= 0:
                break
            idx = c["index"]
            p = c["price"]
            max_allowed = min(rem_pax, c["stock"] - alloc[idx])
            can_afford = rem_budget // p if p > 0 else rem_pax
            take = min(max_allowed, can_afford)
            if take > 0:
                alloc[idx] += take
                rem_pax -= take
                rem_budget -= take * p

    if rem_pax > 0:
        return None

    selected_items = []
    total_cost = 0
    total_calories = 0
    for i, m in enumerate(meals):
        qty = alloc.get(i, 0)
        if qty > 0:
            unit_price = int(m["effective_price"])
            cost = qty * unit_price
            cal = safe_int(m.get("calories"), 400)
            total_cost += cost
            total_calories += qty * cal
            selected_items.append({
                "meal": m,
                "quantity": qty,
                "unit_price": unit_price,
                "total_price": cost
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


def solve_tier(meals, pax, budget, tier="hemat", event_type="Rapat Kantor"):
    """
    Main solver wrapper:
    Tries Google OR-Tools CP-SAT first, and falls back to Pure-Python Engine if unavailable.
    """
    if not meals or pax <= 0:
        return None

    ensure_meal_attributes(meals)

    if HAS_ORTOOLS:
        try:
            sol = solve_tier_ortools(meals, pax, budget, tier=tier, event_type=event_type)
            if sol and sol.get("items"):
                return sol
        except Exception:
            pass

    return solve_tier_fallback(meals, pax, budget, tier=tier, event_type=event_type)


def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input or not raw_input.strip():
            print(json.dumps({"success": False, "message": "Input data JSON kosong."}, ensure_ascii=False))
            return

        payload = json.loads(raw_input)
        event_type = safe_str(payload.get("event_type") or payload.get("eventType"), "Rapat Kantor")
        pax = safe_int(payload.get("pax"), 0)
        budget = safe_int(payload.get("budget"), 0)
        taste_pref = safe_str(payload.get("taste_preference") or payload.get("tastePreference"), "Semua")
        raw_meals = payload.get("meals", [])

        if pax <= 0:
            print(json.dumps({"success": False, "message": "Jumlah peserta minimal 1 orang."}, ensure_ascii=False))
            return

        if budget <= 0:
            print(json.dumps({"success": False, "message": "Anggaran harus lebih dari Rp 0."}, ensure_ascii=False))
            return

        if not isinstance(raw_meals, list) or not raw_meals:
            print(json.dumps({"success": False, "message": "Tidak ada data menu masakan yang aktif di database."}, ensure_ascii=False))
            return

        # 1. Filtering by availability, stock, and dietary/taste preference
        filtered_meals = []
        taste_pref_lower = taste_pref.lower()

        for m in raw_meals:
            # Availability filter
            is_avail = m.get("is_available")
            if is_avail is False or is_avail == 0 or is_avail == "0" or is_avail == "false":
                continue

            # Stock filter
            stock = safe_int(m.get("stock_quantity"), 100)
            if stock <= 0:
                continue
            m["stock_quantity"] = stock

            spicy = safe_str(m.get("spicy_level") or m.get("spicyLevel"), "Tidak Pedas")
            raw_veg = m.get("is_vegetarian") if m.get("is_vegetarian") is not None else m.get("isVegetarian")
            is_veg = bool(raw_veg == 1 or raw_veg is True or str(raw_veg).lower() in ["1", "true"])

            # Taste Preference Filter
            spicy_lower = spicy.lower()
            if taste_pref_lower == "tidak pedas" and spicy_lower == "pedas":
                continue
            elif taste_pref_lower == "pedas" and spicy_lower == "tidak pedas":
                continue
            elif taste_pref_lower == "vegetarian" and not is_veg:
                continue

            # Effective Price calculation
            base_price = safe_int(m.get("price"), 0)
            disc = safe_int(m.get("discount_percent") or m.get("discountPercent"), 0)
            if disc > 0:
                eff_price = int(round(base_price * (1.0 - (disc / 100.0))))
            else:
                eff_price = base_price

            if eff_price <= 0:
                eff_price = base_price if base_price > 0 else 1000

            m["effective_price"] = eff_price
            m["calories"] = safe_int(m.get("calories"), 400)

            filtered_meals.append(m)

        if not filtered_meals:
            print(json.dumps({
                "success": False,
                "message": f"Tidak ditemukan menu yang sesuai dengan batasan rasa '{taste_pref}'. Silakan coba pilih preferensi rasa lain."
            }, ensure_ascii=False))
            return

        # 2. Check Total Stock Feasibility
        total_available_stock = sum(m["stock_quantity"] for m in filtered_meals)
        if total_available_stock < pax:
            print(json.dumps({
                "success": False,
                "message": f"Total stok menu yang tersedia ({total_available_stock} porsi) tidak mencukupi untuk jumlah pesanan ({pax} porsi). Silakan kurangi porsi atau pilih variasi menu lain."
            }, ensure_ascii=False))
            return

        # 3. Check Minimum Budget Feasibility
        min_unit_price = min(m["effective_price"] for m in filtered_meals)
        min_budget_required = min_unit_price * pax

        if budget < min_budget_required:
            print(json.dumps({
                "success": False,
                "message": f"Anggaran {format_idr(budget)} tidak mencukupi. Estimasi biaya minimum untuk {pax} porsi adalah {format_idr(min_budget_required)}. Silakan sesuaikan porsi atau naikkan anggaran."
            }, ensure_ascii=False))
            return

        # 4. Solve 3 Package Tiers
        res_hemat = solve_tier(filtered_meals, pax, budget, tier="hemat", event_type=event_type)
        res_seimbang = solve_tier(filtered_meals, pax, budget, tier="seimbang", event_type=event_type)
        res_premium = solve_tier(filtered_meals, pax, budget, tier="premium", event_type=event_type)

        packages = []
        if res_hemat and res_hemat.get("items"):
            packages.append({
                "id": "pkg-hemat",
                "name": "Paket Hemat & Pas",
                "tier": "hemat",
                "tagline": "Pilihan paling ekonomis dengan gizi lengkap dan higienis",
                "badge": "Paling Hemat",
                "badge_color": "#10B981",  # Emerald
                "total_cost": res_hemat["total_cost"],
                "price_per_pax": res_hemat["price_per_pax"],
                "budget_remaining": res_hemat["budget_remaining"],
                "avg_calories": res_hemat["avg_calories"],
                "items": res_hemat["items"]
            })

        if res_seimbang and res_seimbang.get("items"):
            packages.append({
                "id": "pkg-seimbang",
                "name": "Paket Seimbang & Populer",
                "tier": "seimbang",
                "tagline": "Kombinasi ideal variasi menu, nutrisi seimbang, dan harga terjangkau",
                "badge": "Rekomendasi AI",
                "badge_color": "#0284C7",  # Sky Blue
                "total_cost": res_seimbang["total_cost"],
                "price_per_pax": res_seimbang["price_per_pax"],
                "budget_remaining": res_seimbang["budget_remaining"],
                "avg_calories": res_seimbang["avg_calories"],
                "items": res_seimbang["items"]
            })

        if res_premium and res_premium.get("items"):
            packages.append({
                "id": "pkg-premium",
                "name": "Paket Premium & Mewah",
                "tier": "premium",
                "tagline": "Memaksimalkan anggaran untuk sajian terbaik, kaya protein, dan mewah",
                "badge": "Maksimal & Mewah",
                "badge_color": "#D97706",  # Amber
                "total_cost": res_premium["total_cost"],
                "price_per_pax": res_premium["price_per_pax"],
                "budget_remaining": res_premium["budget_remaining"],
                "avg_calories": res_premium["avg_calories"],
                "items": res_premium["items"]
            })

        if not packages:
            print(json.dumps({
                "success": False,
                "message": f"Tidak dapat menemukan kombinasi menu yang optimal untuk batasan ini. Coba sesuaikan variasi menu atau tambahkan anggaran minimal {format_idr(min_budget_required)}."
            }, ensure_ascii=False))
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
        print(json.dumps(output, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({
            "success": False,
            "message": f"Terjadi kesalahan pada AI Optimization Engine: {str(e)}"
        }, ensure_ascii=False))


if __name__ == "__main__":
    main()
