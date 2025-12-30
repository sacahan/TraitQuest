import logging
from sqlalchemy import select
from app.db.models import GameDefinition
from app.db.session import AsyncSessionLocal

logger = logging.getLogger("app")

class GameAssetsService:
    @staticmethod
    async def get_all_valid_ids() -> dict[str, list[str]]:
        """
        獲取所有類別的合法 ID 清單。
        
        Returns:
            {
                "race": ["RACE_1", ...],
                "class": ["CLS_INTJ", ...],
                "stance": ["STN_D", ...],
                "talent": ["TAL_ACH", ...]
            }
        """
        async with async_session_factory() as session:
            stmt = select(GameDefinition.id, GameDefinition.category)
            result = await session.execute(stmt)
            
            assets = {
                "race": [],
                "class": [],
                "stance": [],
                "talent": []
            }
            
            for row in result:
                id, category = row
                if category in assets:
                    assets[category].append(id)
            
            return assets

    @staticmethod
    async def get_truth_list_dump() -> str:
        """
        獲取用於 AI Validator 的真值清單字串。
        """
        assets = await GameAssetsService.get_all_valid_ids()
        dump = "資料庫真值清單 (Legal Asset IDs):\n"
        dump += f"- 種族 (Race): {', '.join(assets['race'])}\n"
        dump += f"- 職業 (Class): {', '.join(assets['class'])}\n"
        dump += f"- 姿態 (Stance): {', '.join(assets['stance'])}\n"
        dump += f"- 技能 (Talent): {', '.join(assets['talent'])}\n"
        return dump

game_assets_service = GameAssetsService()
