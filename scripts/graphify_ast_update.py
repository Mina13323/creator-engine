import sys, json
from pathlib import Path

# Wrap in main to avoid Windows multiprocessing issues if any worker is spawned
def main():
    from graphify.detect import detect_incremental, save_manifest
    from graphify.extract import collect_files, extract
    from graphify.build import build_merge, build_from_json
    from graphify.cluster import cluster, score_all
    from graphify.analyze import god_nodes, surprising_connections, suggest_questions
    from graphify.report import generate
    from graphify.export import to_json
    
    # 1. Detect incremental changes
    print("Detecting incremental changes...")
    result = detect_incremental(Path('.'))
    new_total = result.get('new_total', 0)
    deleted = list(result.get('deleted_files', []))
    
    print(f"Incremental detection: {new_total} changed files, {len(deleted)} deleted files.")
    
    # 2. Extract AST for changed code files
    code_files = []
    for f in result.get('new_files', {}).get('code', []):
        code_files.extend(collect_files(Path(f)) if Path(f).is_dir() else [Path(f)])
    
    if code_files:
        print(f"Extracting AST for {len(code_files)} code files...")
        ast_extraction = extract(code_files, cache_root=Path('.'))
        print(f"Extracted AST: {len(ast_extraction['nodes'])} nodes, {len(ast_extraction['edges'])} edges")
    else:
        ast_extraction = {'nodes':[],'edges':[],'hyperedges':[],'input_tokens':0,'output_tokens':0}
        print("No changed code files.")
    
    # 3. Merge with existing graph
    print("Merging new AST extraction with existing graph.json...")
    G = build_merge(
        [ast_extraction],
        graph_path='graphify-out/graph.json',
        prune_sources=deleted or None,
    )
    print(f"Merged graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")
    
    # Write merged result back to .graphify_extract.json so report generator sees the full graph
    merged_out = {
        'nodes': [{'id': n, **d} for n, d in G.nodes(data=True)],
        'edges': [
            {**{k: val for k, val in d.items() if k not in ('_src', '_tgt', 'source', 'target')},
             'source': d.get('_src', u), 'target': d.get('_tgt', v)}
            for u, v, d in G.edges(data=True)
        ],
        'hyperedges': list(G.graph.get('hyperedges', [])),
        'input_tokens': ast_extraction.get('input_tokens', 0),
        'output_tokens': ast_extraction.get('output_tokens', 0),
    }
    Path('graphify-out/.graphify_extract.json').write_text(json.dumps(merged_out, ensure_ascii=False), encoding="utf-8")
    
    # 4. Cluster and Analyze
    print("Re-clustering and analyzing the merged graph...")
    communities = cluster(G)
    cohesion = score_all(G, communities)
    tokens = {'input': 0, 'output': 0}
    gods = god_nodes(G)
    surprises = surprising_connections(G, communities)
    
    # Load existing labels if available
    labels_path = Path('graphify-out/.graphify_labels.json')
    if labels_path.exists():
        labels_dict = json.loads(labels_path.read_text(encoding="utf-8"))
        labels = {int(k): v for k, v in labels_dict.items()}
    else:
        labels = {cid: 'Community ' + str(cid) for cid in communities}
    
    questions = suggest_questions(G, communities, labels)
    
    # Load full detect info for report
    detection = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding="utf-8-sig")) if Path('graphify-out/.graphify_detect.json').exists() else {'total_files': 0}
    
    print("Generating GRAPH_REPORT.md...")
    report = generate(G, communities, cohesion, labels, gods, surprises, detection, tokens, '.', suggested_questions=questions)
    Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding="utf-8")
    
    print("Writing graph.json...")
    to_json(G, communities, 'graphify-out/graph.json')
    
    # Save analysis info
    analysis = {
        'communities': {str(k): v for k, v in communities.items()},
        'cohesion': {str(k): v for k, v in cohesion.items()},
        'gods': gods,
        'surprises': surprises,
        'questions': questions,
    }
    Path('graphify-out/.graphify_analysis.json').write_text(json.dumps(analysis, indent=2, ensure_ascii=False), encoding="utf-8")
    
    # Save manifest
    save_manifest(result['files'])
    
    # Clean up temp files
    Path('graphify-out/.graphify_extract.json').unlink(missing_ok=True)
    Path('graphify-out/.graphify_analysis.json').unlink(missing_ok=True)
    
    print("Graphify AST update completed successfully!")

if __name__ == '__main__':
    main()
