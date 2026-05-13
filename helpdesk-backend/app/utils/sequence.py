from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.sequence import Sequence

async def get_next_sequence(db: AsyncSession, entity: str, prefix: str = "GEN") -> str:
    """
    Genera el siguiente código secuencial para una entidad.
    Ejemplo: USR-0001, TK-0042
    """
    # 1. Buscar la secuencia actual
    result = await db.execute(select(Sequence).where(Sequence.entity == entity))
    seq = result.scalar_one_or_none()
    
    if not seq:
        # Inicializar si no existe
        seq = Sequence(entity=entity, last_number=1)
        db.add(seq)
        current_num = 1
    else:
        # Incrementar
        current_num = seq.last_number + 1
        seq.last_number = current_num
        
    await db.commit()
    
    # 2. Formatear con padding de ceros (4 dígitos)
    return f"{prefix}-{str(current_num).zfill(4)}"
