import sys, json
from graphify.build import build_from_json
from graphify.cluster import score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from pathlib import Path
from collections import Counter
import re

extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding="utf-8"))
detect_file = Path('graphify-out/.graphify_detect.json')
try:
    detection = json.loads(detect_file.read_text(encoding="utf-8-sig"))
except:
    detection = json.loads(detect_file.read_text(encoding="utf-8"))
analysis   = json.loads(Path('graphify-out/.graphify_analysis.json').read_text(encoding="utf-8"))

G = build_from_json(extraction)
communities = {int(k): v for k, v in analysis['communities'].items()}
cohesion = {int(k): v for k, v in analysis['cohesion'].items()}
tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}

# Auto-generate labels
labels = {}
for cid, nodes in communities.items():
    words = []
    for n in nodes:
        words.extend([w for w in re.split(r'[^a-zA-Z0-9]+', n) if len(w) > 3])
    if words:
        common = [w[0].capitalize() for w in Counter(words).most_common(3)]
        labels[cid] = " ".join(common) + " Module"
    else:
        labels[cid] = f"Community {cid}"

# Regenerate questions with real community labels (labels affect question phrasing)
questions = suggest_questions(G, communities, labels)

report = generate(G, communities, cohesion, labels, analysis['gods'], analysis['surprises'], detection, tokens, '.', suggested_questions=questions)
Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding="utf-8")
Path('graphify-out/.graphify_labels.json').write_text(json.dumps({str(k): v for k, v in labels.items()}, ensure_ascii=False), encoding="utf-8")
print('Report updated with community labels')
