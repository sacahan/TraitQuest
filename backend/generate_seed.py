import json

races = [
    ("RACE_1", "鐵律族 (Iron Law)", "race", {"enneagram": "1型", "center": "本能", "description": "追求秩序與完美的靈魂，源自遠古法典之山。"}),
    ("RACE_2", "聖靈族 (Holy Spirit)", "race", {"enneagram": "2型", "center": "情感", "description": "渴望被愛與付出的靈魂，源自生命之泉。"}),
    ("RACE_3", "輝光族 (Radiant)", "race", {"enneagram": "3型", "center": "情感", "description": "追求成就與注視的靈魂，源自永恆烈陽。"}),
    ("RACE_4", "幻影族 (Phantom)", "race", {"enneagram": "4型", "center": "情感", "description": "沉浸於獨特與憂傷的靈魂，源自迷霧森林。"}),
    ("RACE_5", "智者族 (Sage)", "race", {"enneagram": "5型", "center": "精神", "description": "渴求知識與觀察的靈魂，源自星辰圖書館。"}),
    ("RACE_6", "堅盾族 (Aegis)", "race", {"enneagram": "6型", "center": "精神", "description": "追求安全與忠誠的靈魂，源自地下堡壘。"}),
    ("RACE_7", "秘風族 (Secret Wind)", "race", {"enneagram": "7型", "center": "精神", "description": "追求自由與新奇的靈魂，源自流浪之雲。"}),
    ("RACE_8", "霸龍族 (Overlord)", "race", {"enneagram": "8型", "center": "本能", "description": "追求力量與控制的靈魂，源自火山熔岩。"}),
    ("RACE_9", "蒼翠族 (Verdant)", "race", {"enneagram": "9型", "center": "本能", "description": "追求和平與融合的靈魂，源自萬物母林。"}),
]

classes = [
    ("CLS_INTJ", "戰略法師", "class", {"mbti": "INTJ", "alignment": "至高議會", "traits": "獨立、戰略、高冷、冷靜。"}),
    ("CLS_INTP", "煉金術士", "class", {"mbti": "INTP", "alignment": "至高議會", "traits": "好奇、創新、邏輯、實驗。"}),
    ("CLS_ENTJ", "領主騎士", "class", {"mbti": "ENTJ", "alignment": "至高議會", "traits": "領導、果斷、高效、野心。"}),
    ("CLS_ENTP", "混沌術士", "class", {"mbti": "ENTP", "alignment": "至高議會", "traits": "聰穎、批判、變通、幽默。"}),
    ("CLS_INFJ", "神聖牧師", "class", {"mbti": "INFJ", "alignment": "縱橫捭闔", "traits": "神秘、同理、堅定、理想。"}),
    ("CLS_INFP", "吟遊詩人", "class", {"mbti": "INFP", "alignment": "縱橫捭闔", "traits": "溫柔、創意、忠於自我。"}),
    ("CLS_ENFJ", "光明聖騎士", "class", {"mbti": "ENFJ", "alignment": "縱橫捭闔", "traits": "魅力、熱情、利他、組織。"}),
    ("CLS_ENFP", "元素召喚師", "class", {"mbti": "ENFP", "alignment": "縱橫捭闔", "traits": "活力、想像、自由、熱誠。"}),
    ("CLS_ISTJ", "重裝守衛", "class", {"mbti": "ISTJ", "alignment": "皇家守衛", "traits": "實務、責任、誠實、紀律。"}),
    ("CLS_ISFJ", "守護治療師", "class", {"mbti": "ISFJ", "alignment": "皇家守衛", "traits": "守護、體貼、可靠、耐心。"}),
    ("CLS_ESTJ", "秩序騎士", "class", {"mbti": "ESTJ", "alignment": "皇家守衛", "traits": "權威、管理、公正、直接。"}),
    ("CLS_ESFJ", "輔助神官", "class", {"mbti": "ESFJ", "alignment": "皇家守衛", "traits": "合作、慷慨、社交、和諧。"}),
    ("CLS_ISTP", "武器工匠", "class", {"mbti": "ISTP", "alignment": "探險聯盟", "traits": "靈活、觀察、技術、冷靜。"}),
    ("CLS_ISFP", "森林遊俠", "class", {"mbti": "ISFP", "alignment": "探險聯盟", "traits": "感性、審美、冒險、低調。"}),
    ("CLS_ESTP", "暗影刺客", "class", {"mbti": "ESTP", "alignment": "探險聯盟", "traits": "行動、大膽、理性、感知。"}),
    ("CLS_ESFP", "幻術舞者", "class", {"mbti": "ESFP", "alignment": "探險聯盟", "traits": "娛樂、自發、社交、表演。"}),
]

stances = [
    ("STN_D", "烈焰戰姿 (Blazing Assault)", "stance", {"disc": "D 支配型", "description": "快速進攻，以力量壓制對手。"}),
    ("STN_I", "潮汐之歌 (Tidal Harmony)", "stance", {"disc": "I 影響型", "description": "激勵隊友，以魅力掌控全場。"}),
    ("STN_S", "大地磐石 (Earthen Rock)", "stance", {"disc": "S 穩健型", "description": "穩守陣地，以韌性保護夥伴。"}),
    ("STN_C", "星辰軌跡 (Starry Orbit)", "stance", {"disc": "C 分析型", "description": "佈下陷阱，以邏輯解構威脅。"}),
]

talents = [
    # Executing
    ("TAL_ACH", "成就", "talent", {"domain": "Executing", "original": "Achiever"}),
    ("TAL_ARR", "排定", "talent", {"domain": "Executing", "original": "Arranger"}),
    ("TAL_BEL", "信仰", "talent", {"domain": "Executing", "original": "Belief"}),
    ("TAL_CON", "公平", "talent", {"domain": "Executing", "original": "Consistency"}),
    ("TAL_DEL", "謹慎", "talent", {"domain": "Executing", "original": "Deliberative"}),
    ("TAL_DIS", "紀律", "talent", {"domain": "Executing", "original": "Discipline"}),
    ("TAL_FOC", "專注", "talent", {"domain": "Executing", "original": "Focus"}),
    ("TAL_RES", "責任", "talent", {"domain": "Executing", "original": "Responsibility"}),
    ("TAL_RSV", "修復", "talent", {"domain": "Executing", "original": "Restorative"}),
    # Influencing
    ("TAL_ACT", "激活", "talent", {"domain": "Influencing", "original": "Activator"}),
    ("TAL_COM", "統率", "talent", {"domain": "Influencing", "original": "Command"}),
    ("TAL_CMU", "溝通", "talent", {"domain": "Influencing", "original": "Communication"}),
    ("TAL_CPT", "競爭", "talent", {"domain": "Influencing", "original": "Competition"}),
    ("TAL_MAX", "完美", "talent", {"domain": "Influencing", "original": "Maximizer"}),
    ("TAL_SAD", "自信", "talent", {"domain": "Influencing", "original": "Self-Assurance"}),
    ("TAL_SIG", "追求", "talent", {"domain": "Influencing", "original": "Significance"}),
    ("TAL_WOO", "取悅", "talent", {"domain": "Influencing", "original": "Woo"}),
    # Relationship
    ("TAL_ADP", "適應", "talent", {"domain": "Relationship Building", "original": "Adaptability"}),
    ("TAL_CNR", "關聯", "talent", {"domain": "Relationship Building", "original": "Connectedness"}), # Fix ID collision if any
    ("TAL_DEV", "發展", "talent", {"domain": "Relationship Building", "original": "Developer"}),
    ("TAL_EMP", "共感", "talent", {"domain": "Relationship Building", "original": "Empathy"}),
    ("TAL_HAR", "和諧", "talent", {"domain": "Relationship Building", "original": "Harmony"}),
    ("TAL_INC", "包容", "talent", {"domain": "Relationship Building", "original": "Includer"}),
    ("TAL_IND", "個別", "talent", {"domain": "Relationship Building", "original": "Individualization"}),
    ("TAL_POS", "積極", "talent", {"domain": "Relationship Building", "original": "Positivity"}),
    ("TAL_REL", "交往", "talent", {"domain": "Relationship Building", "original": "Relator"}),
    # Strategic Thinking
    ("TAL_ANA", "分析", "talent", {"domain": "Strategic Thinking", "original": "Analytical"}),
    ("TAL_CTX", "回顧", "talent", {"domain": "Strategic Thinking", "original": "Context"}),
    ("TAL_FUT", "前瞻", "talent", {"domain": "Strategic Thinking", "original": "Futuristic"}),
    ("TAL_IDE", "理念", "talent", {"domain": "Strategic Thinking", "original": "Ideation"}),
    ("TAL_INP", "蒐集", "talent", {"domain": "Strategic Thinking", "original": "Input"}),
    ("TAL_ITL", "思維", "talent", {"domain": "Strategic Thinking", "original": "Intellection"}),
    ("TAL_LEA", "學習", "talent", {"domain": "Strategic Thinking", "original": "Learner"}),
    ("TAL_STR", "戰略", "talent", {"domain": "Strategic Thinking", "original": "Strategic"}),
]

sql = "-- Seed Game Definitions\n\n"
all_assets = races + classes + stances + talents

for id, name, category, meta in all_assets:
    sql += f"INSERT INTO game_definitions (id, name, category, metadata_info) VALUES ('{id}', '{name}', '{category}', '{json.dumps(meta, ensure_ascii=False)}') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category, metadata_info = EXCLUDED.metadata_info;\n"

with open("/Users/sacahan/Documents/workspace/TraitQuest/backend/migrations/002_seed_game_definitions.sql", "w", encoding="utf-8") as f:
    f.write(sql)

print("Migration SQL generated successfully.")
