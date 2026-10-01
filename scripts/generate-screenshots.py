#!/usr/bin/env python3
"""
Générateur de captures d'écran promotionnelles 1280x800 pour le Chrome Web Store.
Format : JPEG et PNG 24-bit (sans canal alpha).
"""

import os
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "store-assets")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Polices système Windows
FONT_REGULAR = "C:/Windows/Fonts/segoeui.ttf"
FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_SEMIBOLD = "C:/Windows/Fonts/segoeuisb.ttf" if os.path.exists("C:/Windows/Fonts/segoeuisb.ttf") else FONT_BOLD

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

def draw_header(draw, title, subtitle, badge_text="POKÉSKIP POUR POKÉROGUE"):
    # Header badge
    draw.rounded_rectangle([60, 32, 340, 58], radius=8, fill=(14, 165, 233, 40), outline=(56, 189, 248), width=1)
    f_badge = get_font(FONT_BOLD, 12)
    draw.text((80, 38), f"⚡  {badge_text}", fill=(56, 189, 248), font=f_badge)

    # Main Title
    f_title = get_font(FONT_BOLD, 26)
    draw.text((60, 68), title, fill=(248, 250, 252), font=f_title)

    # Subtitle
    f_sub = get_font(FONT_REGULAR, 15)
    draw.text((60, 104), subtitle, fill=(148, 163, 184), font=f_sub)

def create_base_slide():
    im = Image.new("RGB", (1280, 800), color=(11, 17, 32))
    draw = ImageDraw.Draw(im)

    # Subtly draw vertical gradient / glow
    for y in range(800):
        factor = y / 800.0
        r = int(11 + factor * 8)
        g = int(17 + factor * 14)
        b = int(32 + factor * 22)
        draw.line([(0, y), (1280, y)], fill=(r, g, b))

    # Decorative top glow accent
    draw.line([(0, 0), (1280, 0)], fill=(56, 189, 248), width=2)
    return im, draw

def draw_window_frame(draw, x1, y1, x2, y2, title="PokéSkip v1.14.0 — Assistant Intelligent"):
    # Main container
    draw.rounded_rectangle([x1, y1, x2, y2], radius=14, fill=(15, 23, 42), outline=(51, 65, 85), width=1)
    
    # Titlebar
    draw.rounded_rectangle([x1, y1, x2, y1 + 42], radius=14, fill=(30, 41, 59))
    draw.rectangle([x1, y1 + 30, x2, y1 + 42], fill=(30, 41, 59)) # Square bottom corners of titlebar
    draw.line([(x1, y1 + 42), (x2, y1 + 42)], fill=(51, 65, 85), width=1)

    # Window dots
    draw.ellipse([x1 + 16, y1 + 15, x1 + 28, y1 + 27], fill=(239, 68, 68))
    draw.ellipse([x1 + 36, y1 + 15, x1 + 48, y1 + 27], fill=(245, 158, 11))
    draw.ellipse([x1 + 56, y1 + 15, x1 + 68, y1 + 27], fill=(16, 185, 129))

    # Title text
    f_win_title = get_font(FONT_SEMIBOLD, 13)
    draw.text((x1 + 80, y1 + 13), title, fill=(203, 213, 225), font=f_win_title)

def draw_tabs(draw, x, y, active_tab_index=0):
    tabs = [
        ("⚡ Mon Équipe", 130),
        ("⚔️ Types (T)", 120),
        ("🔄 Remplacements", 155),
        ("💾 Espèces", 110),
        ("⚙️ Paramètres", 125)
    ]
    cur_x = x
    f_tab = get_font(FONT_SEMIBOLD, 13)
    for idx, (label, width) in enumerate(tabs):
        is_active = (idx == active_tab_index)
        if is_active:
            draw.rounded_rectangle([cur_x, y, cur_x + width, y + 36], radius=8, fill=(14, 165, 233), outline=(56, 189, 248), width=1)
            draw.text((cur_x + 14, y + 9), label, fill=(255, 255, 255), font=f_tab)
        else:
            draw.rounded_rectangle([cur_x, y, cur_x + width, y + 36], radius=8, fill=(30, 41, 59), outline=(51, 65, 85), width=1)
            draw.text((cur_x + 14, y + 9), label, fill=(148, 163, 184), font=f_tab)
        cur_x += width + 10

# ==============================================================================
# SCREENSHOT 1: MON ÉQUIPE & LIGNÉE ÉVOLUTIVE
# ==============================================================================
def generate_screenshot_1():
    im, draw = create_base_slide()
    draw_header(
        draw,
        title="Lignée Évolutive & Auto-Skip Sélectif des Capacités",
        subtitle="Visualisez toutes les futures attaques jusqu'au niveau 100 et choisissez celles à ignorer automatiquement."
    )
    draw_window_frame(draw, 60, 140, 1220, 755, "PokéSkip — Onglet Mon Équipe")
    draw_tabs(draw, 85, 195, active_tab_index=0)

    # Team Members Bar
    f_pkmn = get_font(FONT_BOLD, 13)
    team = [
        ("Dracaufeu (Niv. 48)", True, (239, 68, 68)),
        ("Pikachu (Niv. 36)", False, (234, 179, 8)),
        ("Tortank (Niv. 45)", False, (59, 130, 246)),
        ("Ectoplasma (Niv. 42)", False, (168, 85, 247)),
        ("Lucario (Niv. 40)", False, (14, 165, 233)),
        ("Carchacrok (Niv. 52)", False, (244, 63, 94))
    ]
    tx = 85
    ty = 245
    for name, active, color in team:
        bg = (30, 41, 59) if not active else (239, 68, 68, 40)
        border = (51, 65, 85) if not active else (239, 68, 68)
        draw.rounded_rectangle([tx, ty, tx + 175, ty + 36], radius=8, fill=bg, outline=border, width=1)
        draw.ellipse([tx + 10, ty + 12, tx + 22, ty + 24], fill=color)
        draw.text((tx + 28, ty + 9), name, fill=(241, 245, 249) if active else (148, 163, 184), font=f_pkmn)
        tx += 185

    # Move Cards Container
    moves_y = 295
    f_m_name = get_font(FONT_BOLD, 15)
    f_m_info = get_font(FONT_REGULAR, 12)
    f_tag = get_font(FONT_BOLD, 11)

    moves = [
        ("Groz'Yeux", "Niv. 1", "Normal", "Statut", "--", "100%", "30", "Baisse la Défense adverse d'un cran.", True, "🧬 Salamèche"),
        ("Flammèche", "Niv. 1", "Feu", "Spécial", "40", "100%", "25", "10% de chances de brûler la cible.", True, "🧬 Salamèche"),
        ("Tranche", "Niv. 30", "Normal", "Physique", "70", "100%", "20", "Taux de coup critique élevé.", False, "🧬 Reptincel"),
        ("Lance-Flammes", "Niv. 54", "Feu", "Spécial", "90", "100%", "15", "Puissante attaque de flammes ardentes.", False, "🧬 Dracaufeu"),
        ("Boutefeu", "Niv. 75", "Feu", "Physique", "120", "100%", "15", "Inflige d'immenses dégâts avec contrecoup.", False, "🧬 Dracaufeu"),
    ]

    for m_name, lvl, m_type, cat, pwr, acc, pp, desc, skipped, lineage in moves:
        box_y = moves_y
        draw.rounded_rectangle([85, box_y, 1195, box_y + 76], radius=10, fill=(24, 33, 49), outline=(51, 65, 85), width=1)

        # Level tag
        draw.rounded_rectangle([100, box_y + 12, 160, box_y + 36], radius=6, fill=(15, 23, 42), outline=(51, 65, 85), width=1)
        draw.text((108, box_y + 16), lvl, fill=(203, 213, 225), font=f_tag)

        # Move Name
        draw.text((175, box_y + 14), m_name, fill=(248, 250, 252), font=f_m_name)

        # Lineage Badge
        draw.rounded_rectangle([320, box_y + 14, 435, box_y + 36], radius=6, fill=(56, 189, 248, 30), outline=(56, 189, 248), width=1)
        draw.text((328, box_y + 17), lineage, fill=(56, 189, 248), font=f_tag)

        # Type badge
        t_color = (239, 68, 68) if m_type == "Feu" else (168, 162, 158)
        draw.rounded_rectangle([445, box_y + 14, 515, box_y + 36], radius=6, fill=t_color)
        draw.text((455, box_y + 17), m_type, fill=(255, 255, 255), font=f_tag)

        # Category badge
        c_color = (244, 63, 94) if cat == "Physique" else ((59, 130, 246) if cat == "Spécial" else (148, 163, 184))
        draw.rounded_rectangle([525, box_y + 14, 605, box_y + 36], radius=6, fill=c_color)
        draw.text((535, box_y + 17), cat, fill=(255, 255, 255), font=f_tag)

        # Stats info
        info_str = f"Puissance : {pwr}   •   Précision : {acc}   •   PP : {pp}   •   {desc}"
        draw.text((105, box_y + 48), info_str, fill=(148, 163, 184), font=f_m_info)

        # Status Toggle Right
        if skipped:
            draw.rounded_rectangle([1040, box_y + 20, 1175, box_y + 56], radius=8, fill=(239, 68, 68, 40), outline=(239, 68, 68), width=1)
            draw.text((1055, box_y + 28), "✕ Ignorée (Skip)", fill=(248, 113, 113), font=f_tag)
        else:
            draw.rounded_rectangle([1040, box_y + 20, 1175, box_y + 56], radius=8, fill=(16, 185, 129, 40), outline=(16, 185, 129), width=1)
            draw.text((1055, box_y + 28), "✓ Gardée", fill=(52, 211, 153), font=f_tag)

        moves_y += 86

    return im

# ==============================================================================
# SCREENSHOT 2: TABLEAU DES TYPES TACTIQUE (T)
# ==============================================================================
def generate_screenshot_2():
    im, draw = create_base_slide()
    draw_header(
        draw,
        title="Tableau des Types & Calculateur Tactique en Combat",
        subtitle="Appuyez sur T en combat pour afficher instantanément faiblesses, immunités et forces contre l'adversaire."
    )
    draw_window_frame(draw, 60, 140, 1220, 755, "PokéSkip — Matrice des Forces & Faiblesses (Touche T)")
    draw_tabs(draw, 85, 195, active_tab_index=1)

    f_sub = get_font(FONT_BOLD, 14)
    f_tag = get_font(FONT_BOLD, 12)
    f_note = get_font(FONT_REGULAR, 12)

    # Sub-controls
    draw.rounded_rectangle([85, 245, 250, 280], radius=8, fill=(14, 165, 233), outline=(56, 189, 248), width=1)
    draw.text((100, 254), "⚡ Vue Simplifiée", fill=(255, 255, 255), font=f_sub)

    draw.rounded_rectangle([260, 245, 420, 280], radius=8, fill=(30, 41, 59), outline=(51, 65, 85), width=1)
    draw.text((275, 254), "📊 Matrice 18x18", fill=(148, 163, 184), font=f_sub)

    # Opponent Target Badge
    draw.rounded_rectangle([850, 245, 1195, 280], radius=8, fill=(30, 41, 59), outline=(239, 68, 68), width=1)
    draw.text((865, 254), "🎯 Cible en combat : Léviator (Eau / Vol)", fill=(248, 113, 113), font=f_tag)

    # Types Grid Header
    table_y = 295
    draw.rounded_rectangle([85, table_y, 1195, table_y + 36], radius=6, fill=(30, 41, 59))
    draw.text((105, table_y + 9), "⚠️ FAIBLESSES SUBIES (×2)", fill=(248, 113, 113), font=f_tag)
    draw.text((540, table_y + 9), "TYPE DÉFENSEUR", fill=(241, 245, 249), font=f_tag)
    draw.text((850, table_y + 9), "⚔️ FORCES OFFENSIVES (×2 INFLIGÉ)", fill=(52, 211, 153), font=f_tag)

    # Type Rows
    type_data = [
        ("Feu", (239, 68, 68), ["Eau", "Sol", "Roche"], ["Plante", "Glace", "Insecte", "Acier"]),
        ("Eau", (59, 130, 246), ["Plante", "Électrik"], ["Feu", "Sol", "Roche"]),
        ("Plante", (34, 197, 94), ["Feu", "Glace", "Poison", "Vol", "Insecte"], ["Eau", "Sol", "Roche"]),
        ("Électrik", (234, 179, 8), ["Sol (×2 • Immunisé ×0)"], ["Eau", "Vol"]),
        ("Spectre", (168, 85, 247), ["Spectre", "Ténèbres (Normal/Combat ×0)"], ["Spectre", "Psy"]),
        ("Dragon", (99, 102, 241), ["Glace", "Dragon", "Fée"], ["Dragon"]),
        ("Acier", (148, 163, 184), ["Feu", "Combat", "Sol (Poison ×0)"], ["Glace", "Roche", "Fée"])
    ]

    ty = table_y + 45
    for t_name, color, weaknesses, strengths in type_data:
        draw.rounded_rectangle([85, ty, 1195, ty + 50], radius=8, fill=(24, 33, 49), outline=(51, 65, 85), width=1)

        # Weaknesses list
        draw.text((105, ty + 16), ", ".join(weaknesses), fill=(248, 113, 113), font=f_note)

        # Type badge in center
        draw.rounded_rectangle([520, ty + 10, 640, ty + 40], radius=6, fill=color)
        draw.text((545, ty + 15), t_name, fill=(255, 255, 255), font=f_tag)

        # Strengths list
        draw.text((850, ty + 16), ", ".join(strengths), fill=(52, 211, 153), font=f_note)

        ty += 58

    return im

# ==============================================================================
# SCREENSHOT 3: MODE AVANCÉ — REMPLACEMENTS AUTOMATIQUES
# ==============================================================================
def generate_screenshot_3():
    im, draw = create_base_slide()
    draw_header(
        draw,
        title="Remplacements Automatiques Intelligents (Mode Avancé)",
        subtitle="Automatisez l'écrasement d'une attaque par une nouvelle dès son apprentissage (ex: Flammèche ➜ Lance-Flammes)."
    )
    draw_window_frame(draw, 60, 140, 1220, 755, "PokéSkip — Onglet Remplacements")
    draw_tabs(draw, 85, 195, active_tab_index=2)

    f_bold = get_font(FONT_BOLD, 15)
    f_tag = get_font(FONT_BOLD, 12)
    f_sub = get_font(FONT_REGULAR, 13)

    # Info banner
    draw.rounded_rectangle([85, 245, 1195, 290], radius=8, fill=(14, 165, 233, 20), outline=(56, 189, 248), width=1)
    draw.text((105, 258), "💡 En combat, dès que la nouvelle capacité est apprise, PokéSkip remplace l'ancienne sans interruption de run.", fill=(56, 189, 248), font=f_sub)

    # Rules Cards
    rules = [
        ("Salamèche / Dracaufeu", "Flammèche", "Lance-Flammes", "Actif"),
        ("Pikachu / Raichu", "Éclair", "Tonnerre", "Actif"),
        ("Tortank", "Pistolet à O", "Hydrocanon", "Actif"),
        ("Lucario", "Vive-Attaque", "Vit.Extrême", "Actif"),
        ("Ectoplasma", "Léchouille", "Ball'Ombre", "Actif")
    ]

    ry = 310
    for species, old_m, new_m, status in rules:
        draw.rounded_rectangle([85, ry, 1195, ry + 68], radius=10, fill=(24, 33, 49), outline=(51, 65, 85), width=1)

        # Species tag
        draw.rounded_rectangle([105, ry + 18, 280, ry + 50], radius=6, fill=(30, 41, 59), outline=(51, 65, 85), width=1)
        draw.text((120, ry + 24), f"🧬 {species}", fill=(241, 245, 249), font=f_tag)

        # Replacement formula
        draw.text((310, ry + 22), "Remplacer :", fill=(148, 163, 184), font=f_sub)
        
        # Old move (Red badge)
        draw.rounded_rectangle([400, ry + 18, 540, ry + 50], radius=6, fill=(239, 68, 68, 30), outline=(239, 68, 68), width=1)
        draw.text((415, ry + 24), f"✕  {old_m}", fill=(248, 113, 113), font=f_bold)

        draw.text((560, ry + 20), "➔", fill=(56, 189, 248), font=get_font(FONT_BOLD, 20))

        draw.text((600, ry + 22), "par :", fill=(148, 163, 184), font=f_sub)

        # New move (Green badge)
        draw.rounded_rectangle([645, ry + 18, 805, ry + 50], radius=6, fill=(16, 185, 129, 30), outline=(16, 185, 129), width=1)
        draw.text((660, ry + 24), f"✓  {new_m}", fill=(52, 211, 153), font=f_bold)

        # Status badge right
        draw.rounded_rectangle([1070, ry + 18, 1175, ry + 50], radius=6, fill=(16, 185, 129), width=1)
        draw.text((1090, ry + 24), f"● {status}", fill=(255, 255, 255), font=f_tag)

        ry += 80

    return im

# ==============================================================================
# SCREENSHOT 4: QUICK SKIP PROMPT & HUD EN COMBAT
# ==============================================================================
def generate_screenshot_4():
    im, draw = create_base_slide()
    draw_header(
        draw,
        title="Prompt Rapide en Jeu & HUD Discret de Contrôle",
        subtitle="Une nouvelle capacité surgit ? Décidez en un clic de l'ignorer pour toujours ou de ne plus demander."
    )
    draw_window_frame(draw, 60, 140, 1220, 755, "PokéRogue — Phase de Combat avec PokéSkip")

    f_bold = get_font(FONT_BOLD, 15)
    f_tag = get_font(FONT_BOLD, 12)
    f_sub = get_font(FONT_REGULAR, 14)

    # Simulated Battle Scene Background
    draw.rounded_rectangle([85, 195, 1195, 735], radius=10, fill=(15, 23, 42), outline=(30, 41, 59), width=1)
    
    # Floor line / arena gradient
    draw.ellipse([200, 520, 1080, 680], fill=(24, 33, 49), outline=(51, 65, 85), width=1)

    # Simulated PokéRogue Battle HUD Dialogue at bottom
    draw.rounded_rectangle([120, 580, 1160, 700], radius=10, fill=(30, 41, 59), outline=(56, 189, 248), width=2)
    draw.text((150, 610), "Dracaufeu souhaite apprendre l'attaque Rugissement...", fill=(248, 250, 252), font=get_font(FONT_BOLD, 18))
    draw.text((150, 645), "Mais Dracaufeu connaît déjà 4 capacités !", fill=(148, 163, 184), font=f_sub)

    # TOP CENTER: POKESKIP QUICK SKIP PROMPT BANNER
    px1, py1, px2, py2 = 230, 220, 1050, 310
    draw.rounded_rectangle([px1, py1, px2, py2], radius=12, fill=(15, 23, 42), outline=(56, 189, 248), width=2)

    draw.text((260, 240), "⚡  Ignorer ", fill=(241, 245, 249), font=f_bold)
    draw.text((345, 240), "Rugissement", fill=(248, 113, 113), font=f_bold)
    draw.text((455, 240), " pour ", fill=(241, 245, 249), font=f_bold)
    draw.text((505, 240), "Dracaufeu", fill=(56, 189, 248), font=f_bold)
    draw.text((595, 240), " ?", fill=(241, 245, 249), font=f_bold)

    # Button 1: Toujours ignorer
    draw.rounded_rectangle([680, 232, 850, 275], radius=8, fill=(239, 68, 68))
    draw.text((698, 243), "✕ Toujours ignorer", fill=(255, 255, 255), font=f_tag)

    # Button 2: Ne plus demander
    draw.rounded_rectangle([865, 232, 1010, 275], radius=8, fill=(51, 65, 85), outline=(100, 116, 139), width=1)
    draw.text((880, 243), "🔕 Ne plus demander", fill=(203, 213, 225), font=f_tag)

    # Close button
    draw.text((1025, 236), "✕", fill=(148, 163, 184), font=f_bold)

    # Top right HUD Floating Bubble
    hx, hy = 1040, 335
    draw.rounded_rectangle([hx, hy, hx + 130, hy + 46], radius=23, fill=(15, 23, 42), outline=(56, 189, 248), width=2)
    draw.ellipse([hx + 6, hy + 6, hx + 40, hy + 40], fill=(14, 165, 233))
    draw.text((hx + 17, hy + 13), "⚡", fill=(255, 255, 255), font=f_bold)
    draw.text((hx + 46, hy + 14), "14 skips", fill=(56, 189, 248), font=f_tag)

    return im

# ==============================================================================
# SCREENSHOT 5: SAUVEGARDE ÉTERNELLE PAR ESPÈCE & PARAMÈTRES
# ==============================================================================
def generate_screenshot_5():
    im, draw = create_base_slide()
    draw_header(
        draw,
        title="Sauvegarde Éternelle par Espèce & Paramètres Personnalisés",
        subtitle="Vos règles persistent d'une run à l'autre sans jamais avoir à reconfigurer vos Pokémon favoris."
    )
    draw_window_frame(draw, 60, 140, 1220, 755, "PokéSkip — Espèces Enregistrées & Paramètres")
    draw_tabs(draw, 85, 195, active_tab_index=3)

    f_bold = get_font(FONT_BOLD, 15)
    f_tag = get_font(FONT_BOLD, 12)
    f_sub = get_font(FONT_REGULAR, 13)

    # Left Column: Saved species
    draw.rounded_rectangle([85, 245, 620, 735], radius=10, fill=(24, 33, 49), outline=(51, 65, 85), width=1)
    draw.text((110, 265), "💾 ESPÈCES ENREGISTRÉES DANS VOS RUNS", fill=(56, 189, 248), font=f_tag)

    species_list = [
        ("Salamèche / Dracaufeu", "4 capacités ignorées • 1 remplacement", (239, 68, 68)),
        ("Pikachu / Raichu", "3 capacités ignorées • 1 remplacement", (234, 179, 8)),
        ("Tortank", "2 capacités ignorées • 1 remplacement", (59, 130, 246)),
        ("Ectoplasma", "3 capacités ignorées", (168, 85, 247)),
        ("Lucario", "1 capacité ignorée", (14, 165, 233)),
        ("Carchacrok", "2 capacités ignorées", (244, 63, 94))
    ]

    sy = 300
    for name, desc, color in species_list:
        draw.rounded_rectangle([105, sy, 600, sy + 60], radius=8, fill=(15, 23, 42), outline=(51, 65, 85), width=1)
        draw.ellipse([120, sy + 15, 150, sy + 45], fill=color)
        draw.text((165, sy + 12), name, fill=(241, 245, 249), font=f_bold)
        draw.text((165, sy + 35), desc, fill=(148, 163, 184), font=f_sub)
        draw.rounded_rectangle([520, sy + 16, 585, sy + 44], radius=6, fill=(30, 41, 59), outline=(56, 189, 248), width=1)
        draw.text((534, sy + 22), "Éditer", fill=(56, 189, 248), font=f_tag)
        sy += 70

    # Right Column: Settings
    draw.rounded_rectangle([645, 245, 1195, 735], radius=10, fill=(24, 33, 49), outline=(51, 65, 85), width=1)
    draw.text((670, 265), "⚙️ PARAMÈTRES & PRÉFÉRENCES DU PLUGIN", fill=(56, 189, 248), font=f_tag)

    settings = [
        ("Activer PokéSkip", "Activer ou désactiver l'ensemble de l'automatisation", True),
        ("Mode Avancé (Remplacements)", "Permet de remplacer automatiquement des attaques ciblées", True),
        ("Bannière Prompt Rapide", "Affiche la confirmation rapide lors des nouvelles capacités", True),
        ("Notifications Toasts", "Affiche des alertes discrètes lors d'un skip ou remplacement", True),
        ("Raccourci Clavier P", "Ouvre ou ferme le menu de configuration PokéSkip", True),
        ("Raccourci Clavier T", "Ouvre ou ferme le tableau tactique des types en combat", True)
    ]

    py = 300
    for s_title, s_desc, enabled in settings:
        draw.rounded_rectangle([665, py, 1175, py + 60], radius=8, fill=(15, 23, 42), outline=(51, 65, 85), width=1)
        draw.text((685, py + 12), s_title, fill=(241, 245, 249), font=f_bold)
        draw.text((685, py + 35), s_desc, fill=(148, 163, 184), font=f_sub)

        # Toggle Switch
        sw_x, sw_y = 1110, py + 18
        draw.rounded_rectangle([sw_x, sw_y, sw_x + 48, sw_y + 24], radius=12, fill=(16, 185, 129))
        draw.ellipse([sw_x + 26, sw_y + 2, sw_x + 46, sw_y + 22], fill=(255, 255, 255))

        py += 70

    return im

def main():
    generators = [
        ("1-team", generate_screenshot_1),
        ("2-types", generate_screenshot_2),
        ("3-replacements", generate_screenshot_3),
        ("4-prompt", generate_screenshot_4),
        ("5-settings", generate_screenshot_5),
    ]

    print("Génération des 5 captures d'écran promotionnelles (1280x800)...")
    for name, gen_fn in generators:
        img = gen_fn()
        # Save as JPEG (Quality 95, guaranteed 24-bit no alpha)
        jpg_path = os.path.join(OUTPUT_DIR, f"screenshot-{name}.jpg")
        img.save(jpg_path, "JPEG", quality=95)

        # Save as 24-bit RGB PNG (without alpha)
        png_path = os.path.join(OUTPUT_DIR, f"screenshot-{name}.png")
        img.convert("RGB").save(png_path, "PNG")

        print(f"[OK] {jpg_path} (1280x800 JPEG)")
        print(f"[OK] {png_path} (1280x800 PNG 24-bit)")

if __name__ == "__main__":
    main()
