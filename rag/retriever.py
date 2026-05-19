import os
from configs.settings import TOP_K_RAG

_KNOWLEDGE_PATH = os.path.join(os.path.dirname(__file__), "knowledge.txt")
_cache: dict[str, list[str]] = {}


def _load_knowledge() -> dict[str, list[str]]:
    """Parse knowledge.txt into a dict of {disease: [lines]}."""
    if _cache:
        return _cache

    with open(_KNOWLEDGE_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    current_section = None
    for line in content.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith("[") and line.endswith("]"):
            current_section = line[1:-1].lower()
            _cache[current_section] = []
        elif current_section and line:
            _cache[current_section].append(line)

    return _cache


def retrieve_context(disease: str, query: str = "") -> str:
    """
    Return relevant knowledge lines for a disease.
    If a query is provided, prefer lines that contain query keywords.
    Falls back to the first TOP_K_RAG lines of the disease section.
    """
    knowledge = _load_knowledge()
    disease_key = disease.lower()

    if disease_key not in knowledge:
        return f"No specific knowledge available for {disease}."

    lines = knowledge[disease_key]

    if query:
        keywords = [w.lower() for w in query.split() if len(w) > 3]
        scored = []
        for line in lines:
            score = sum(1 for kw in keywords if kw in line.lower())
            scored.append((score, line))
        scored.sort(key=lambda x: x[0], reverse=True)
        top = [line for _, line in scored[:TOP_K_RAG]]
        # Pad with general lines if not enough matches
        if len(top) < TOP_K_RAG:
            for line in lines:
                if line not in top:
                    top.append(line)
                if len(top) >= TOP_K_RAG:
                    break
    else:
        top = lines[:TOP_K_RAG]

    return "\n".join(top)
