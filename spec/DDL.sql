-- public.game_definitions definition

-- Drop table

-- DROP TABLE public.game_definitions;

CREATE TABLE public.game_definitions (
	id varchar NOT NULL,
	category varchar NOT NULL,
	"name" varchar NOT NULL,
	metadata_info jsonb DEFAULT '{}'::jsonb NULL,
	CONSTRAINT game_definitions_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_game_definitions_category ON public.game_definitions USING btree (category);

-- public.user_quests definition

-- Drop table

-- DROP TABLE public.user_quests;

CREATE TABLE public.user_quests (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	user_id uuid NOT NULL,
	quest_type varchar NOT NULL,
	interactions jsonb DEFAULT '[]'::jsonb NOT NULL,
	quest_report jsonb DEFAULT '{}'::jsonb NOT NULL,
	hero_chronicle text NULL,
	completed_at timestamptz NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT user_quests_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_user_quests_completed_at ON public.user_quests USING btree (completed_at);
CREATE INDEX idx_user_quests_user_id ON public.user_quests USING btree (user_id);


-- public.user_quests foreign keys

ALTER TABLE public.user_quests ADD CONSTRAINT user_quests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	google_id varchar NOT NULL,
	display_name varchar NULL,
	"level" int4 DEFAULT 1 NOT NULL,
	"exp" int4 DEFAULT 0 NOT NULL,
	hero_class_id varchar NULL,
	hero_avatar_url varchar NULL,
	hero_profile jsonb DEFAULT '{}'::jsonb NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT users_google_id_key UNIQUE (google_id),
	CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_users_google_id ON public.users USING btree (google_id);

INSERT INTO public.game_definitions (id,category,"name",metadata_info) VALUES
	 ('RACE_1','race','鐵律族 (Iron Law)','{"center": "本能", "enneagram": "1型", "description": "追求秩序與完美的靈魂，源自遠古法典之山。"}'),
	 ('RACE_2','race','聖靈族 (Holy Spirit)','{"center": "情感", "enneagram": "2型", "description": "渴望被愛與付出的靈魂，源自生命之泉。"}'),
	 ('RACE_3','race','輝光族 (Radiant)','{"center": "情感", "enneagram": "3型", "description": "追求成就與注視的靈魂，源自永恆烈陽。"}'),
	 ('RACE_4','race','幻影族 (Phantom)','{"center": "情感", "enneagram": "4型", "description": "沉浸於獨特與憂傷的靈魂，源自迷霧森林。"}'),
	 ('RACE_5','race','智者族 (Sage)','{"center": "精神", "enneagram": "5型", "description": "渴求知識與觀察的靈魂，源自星辰圖書館。"}'),
	 ('RACE_6','race','堅盾族 (Aegis)','{"center": "精神", "enneagram": "6型", "description": "追求安全與忠誠的靈魂，源自地下堡壘。"}'),
	 ('RACE_7','race','秘風族 (Secret Wind)','{"center": "精神", "enneagram": "7型", "description": "追求自由與新奇的靈魂，源自流浪之雲。"}'),
	 ('RACE_8','race','霸龍族 (Overlord)','{"center": "本能", "enneagram": "8型", "description": "追求力量與控制的靈魂，源自火山熔岩。"}'),
	 ('RACE_9','race','蒼翠族 (Verdant)','{"center": "本能", "enneagram": "9型", "description": "追求和平與融合的靈魂，源自萬物母林。"}'),
	 ('CLS_INTJ','class','戰略法師','{"mbti": "INTJ", "traits": "獨立、戰略、高冷、冷靜。", "alignment": "至高議會"}');
INSERT INTO public.game_definitions (id,category,"name",metadata_info) VALUES
	 ('CLS_INTP','class','煉金術士','{"mbti": "INTP", "traits": "好奇、創新、邏輯、實驗。", "alignment": "至高議會"}'),
	 ('CLS_ENTJ','class','領主騎士','{"mbti": "ENTJ", "traits": "領導、果斷、高效、野心。", "alignment": "至高議會"}'),
	 ('CLS_ENTP','class','混沌術士','{"mbti": "ENTP", "traits": "聰穎、批判、變通、幽默。", "alignment": "至高議會"}'),
	 ('CLS_INFJ','class','神聖牧師','{"mbti": "INFJ", "traits": "神秘、同理、堅定、理想。", "alignment": "縱橫捭闔"}'),
	 ('CLS_INFP','class','吟遊詩人','{"mbti": "INFP", "traits": "溫柔、創意、忠於自我。", "alignment": "縱橫捭闔"}'),
	 ('CLS_ENFJ','class','光明聖騎士','{"mbti": "ENFJ", "traits": "魅力、熱情、利他、組織。", "alignment": "縱橫捭闔"}'),
	 ('CLS_ENFP','class','元素召喚師','{"mbti": "ENFP", "traits": "活力、想像、自由、熱誠。", "alignment": "縱橫捭闔"}'),
	 ('CLS_ISTJ','class','重裝守衛','{"mbti": "ISTJ", "traits": "實務、責任、誠實、紀律。", "alignment": "皇家守衛"}'),
	 ('CLS_ISFJ','class','守護治療師','{"mbti": "ISFJ", "traits": "守護、體貼、可靠、耐心。", "alignment": "皇家守衛"}'),
	 ('CLS_ESTJ','class','秩序騎士','{"mbti": "ESTJ", "traits": "權威、管理、公正、直接。", "alignment": "皇家守衛"}');
INSERT INTO public.game_definitions (id,category,"name",metadata_info) VALUES
	 ('CLS_ESFJ','class','輔助神官','{"mbti": "ESFJ", "traits": "合作、慷慨、社交、和諧。", "alignment": "皇家守衛"}'),
	 ('CLS_ISTP','class','武器工匠','{"mbti": "ISTP", "traits": "靈活、觀察、技術、冷靜。", "alignment": "探險聯盟"}'),
	 ('CLS_ISFP','class','森林遊俠','{"mbti": "ISFP", "traits": "感性、審美、冒險、低調。", "alignment": "探險聯盟"}'),
	 ('CLS_ESTP','class','暗影刺客','{"mbti": "ESTP", "traits": "行動、大膽、理性、感知。", "alignment": "探險聯盟"}'),
	 ('CLS_ESFP','class','幻術舞者','{"mbti": "ESFP", "traits": "娛樂、自發、社交、表演。", "alignment": "探險聯盟"}'),
	 ('STN_D','stance','烈焰戰姿 (Blazing Assault)','{"disc": "D 支配型", "description": "快速進攻，以力量壓制對手。"}'),
	 ('STN_I','stance','潮汐之歌 (Tidal Harmony)','{"disc": "I 影響型", "description": "激勵隊友，以魅力掌控全場。"}'),
	 ('STN_S','stance','大地磐石 (Earthen Rock)','{"disc": "S 穩健型", "description": "穩守陣地，以韌性保護夥伴。"}'),
	 ('STN_C','stance','星辰軌跡 (Starry Orbit)','{"disc": "C 分析型", "description": "佈下陷阱，以邏輯解構威脅。"}'),
	 ('TAL_ACH','talent','成就','{"domain": "Executing", "original": "Achiever"}');
INSERT INTO public.game_definitions (id,category,"name",metadata_info) VALUES
	 ('TAL_ARR','talent','排定','{"domain": "Executing", "original": "Arranger"}'),
	 ('TAL_BEL','talent','信仰','{"domain": "Executing", "original": "Belief"}'),
	 ('TAL_CON','talent','公平','{"domain": "Executing", "original": "Consistency"}'),
	 ('TAL_DEL','talent','謹慎','{"domain": "Executing", "original": "Deliberative"}'),
	 ('TAL_DIS','talent','紀律','{"domain": "Executing", "original": "Discipline"}'),
	 ('TAL_FOC','talent','專注','{"domain": "Executing", "original": "Focus"}'),
	 ('TAL_RES','talent','責任','{"domain": "Executing", "original": "Responsibility"}'),
	 ('TAL_RSV','talent','修復','{"domain": "Executing", "original": "Restorative"}'),
	 ('TAL_ACT','talent','激活','{"domain": "Influencing", "original": "Activator"}'),
	 ('TAL_COM','talent','統率','{"domain": "Influencing", "original": "Command"}');
INSERT INTO public.game_definitions (id,category,"name",metadata_info) VALUES
	 ('TAL_CMU','talent','溝通','{"domain": "Influencing", "original": "Communication"}'),
	 ('TAL_CPT','talent','競爭','{"domain": "Influencing", "original": "Competition"}'),
	 ('TAL_MAX','talent','完美','{"domain": "Influencing", "original": "Maximizer"}'),
	 ('TAL_SAD','talent','自信','{"domain": "Influencing", "original": "Self-Assurance"}'),
	 ('TAL_SIG','talent','追求','{"domain": "Influencing", "original": "Significance"}'),
	 ('TAL_WOO','talent','取悅','{"domain": "Influencing", "original": "Woo"}'),
	 ('TAL_ADP','talent','適應','{"domain": "Relationship Building", "original": "Adaptability"}'),
	 ('TAL_CNR','talent','關聯','{"domain": "Relationship Building", "original": "Connectedness"}'),
	 ('TAL_DEV','talent','發展','{"domain": "Relationship Building", "original": "Developer"}'),
	 ('TAL_EMP','talent','共感','{"domain": "Relationship Building", "original": "Empathy"}');
INSERT INTO public.game_definitions (id,category,"name",metadata_info) VALUES
	 ('TAL_HAR','talent','和諧','{"domain": "Relationship Building", "original": "Harmony"}'),
	 ('TAL_INC','talent','包容','{"domain": "Relationship Building", "original": "Includer"}'),
	 ('TAL_IND','talent','個別','{"domain": "Relationship Building", "original": "Individualization"}'),
	 ('TAL_POS','talent','積極','{"domain": "Relationship Building", "original": "Positivity"}'),
	 ('TAL_REL','talent','交往','{"domain": "Relationship Building", "original": "Relator"}'),
	 ('TAL_ANA','talent','分析','{"domain": "Strategic Thinking", "original": "Analytical"}'),
	 ('TAL_CTX','talent','回顧','{"domain": "Strategic Thinking", "original": "Context"}'),
	 ('TAL_FUT','talent','前瞻','{"domain": "Strategic Thinking", "original": "Futuristic"}'),
	 ('TAL_IDE','talent','理念','{"domain": "Strategic Thinking", "original": "Ideation"}'),
	 ('TAL_INP','talent','蒐集','{"domain": "Strategic Thinking", "original": "Input"}');
INSERT INTO public.game_definitions (id,category,"name",metadata_info) VALUES
	 ('TAL_ITL','talent','思維','{"domain": "Strategic Thinking", "original": "Intellection"}'),
	 ('TAL_LEA','talent','學習','{"domain": "Strategic Thinking", "original": "Learner"}'),
	 ('TAL_STR','talent','戰略','{"domain": "Strategic Thinking", "original": "Strategic"}');
