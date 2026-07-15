(function () {
  const direct = (path, zh, en) => ({ path, relation: 'direct', label: { zh, en } });
  const diagnostic = (path, zh, en) => ({ path, relation: 'diagnostic', label: { zh, en } });

  window.AI4AI_HERO_CONFIG = [
    {
      expId: 'pt-short-trace-compress',
      compareTo: 'q30b-traceability-repair-synth',
      raw: [direct('assets/raw-traces/repair-126-253turn.txt', '253-turn 证据丢失失败', '253-turn evidence-loss failure')]
    },
    {
      expId: 'q30b-traceability-repair-synth',
      compareTo: 'pt-short-trace-compress',
      raw: [
        direct('assets/raw-traces/repair-000-correct.txt', '15-turn 正确停止', '15-turn correct stop'),
        direct('assets/raw-traces/repair-050-wrong.txt', '同名候选判断失败', 'Wrong same-name candidate'),
        direct('assets/raw-traces/repair-126-253turn.txt', '253-turn hard 失败', '253-turn hard failure'),
        direct('assets/raw-traces/repair-201-no-final.txt', '长搜索后未正确提交', 'No valid finalization after long search')
      ]
    },
    {
      expId: 'pt-hard-data-mixing',
      compareTo: 'q30b-traceability-repair-synth',
      raw: [
        diagnostic('assets/raw-traces/finalverify-000-ufc.txt', '精确多约束成功案例', 'Precise multi-constraint success'),
        diagnostic('assets/raw-traces/finalverify-025-restaurant.txt', '名称归一失败', 'Name-normalization failure'),
        diagnostic('assets/raw-traces/finalverify-044-song.txt', '183-turn 搜索崩溃', '183-turn search collapse')
      ]
    },
    {
      expId: 'q30b-softrepair-wikicapsule-composition',
      compareTo: 'q30b-traceability-repair-synth',
      raw: [diagnostic('assets/raw-traces/finalverify-007-book.txt', '52-turn 证据完整成功案例', '52-turn evidence-complete success')]
    },
    {
      expId: 'q30b-coldpath-pivot-synth',
      compareTo: 'openseeker-source-refresh-sft',
      raw: [
        diagnostic('assets/raw-traces/kimi-000-bird.txt', '15-turn 直接证据路径', '15-turn direct evidence path'),
        diagnostic('assets/raw-traces/kimi-022-surgeon.txt', '69-turn 完整链条仍为 0 分', '69-turn complete-looking zero-score chain')
      ]
    },
    {
      expId: 'openseeker-source-refresh-sft',
      compareTo: 'q30b-coldpath-pivot-synth',
      raw: [
        diagnostic('assets/raw-traces/kimi-110-correct-long.txt', '222-turn 长搜索答对', '222-turn correct long search'),
        diagnostic('assets/raw-traces/kimi-118-wrong-long.txt', '226-turn 长搜索答错', '226-turn wrong long search')
      ]
    },
    {
      expId: 'q30b-hard-arb-synth-neg',
      compareTo: 'q30b-coldpath-pivot-synth',
      raw: [
        direct('assets/raw-traces/hardarb-000-correct.txt', '正确候选排除', 'Correct candidate arbitration'),
        direct('assets/raw-traces/hardarb-007-wrong.txt', '候选排除失败', 'Candidate-arbitration failure'),
        direct('assets/raw-traces/hardarb-083-warning.txt', '触发 warning 的错误轨迹', 'Wrong trace under warning pressure'),
        direct('assets/raw-traces/hardarb-131-correct-warning.txt', '触发 warning 但答对', 'Correct trace under warning pressure')
      ]
    },
    {
      expId: 'q30b-final-verification-terminal',
      compareTo: 'q30b-hard-arb-synth-neg',
      raw: [
        direct('assets/raw-traces/finalverify-000-ufc.txt', '终局验证成功', 'Successful terminal verification'),
        direct('assets/raw-traces/finalverify-025-restaurant.txt', '87-turn 答案规范化失败', '87-turn answer-normalization failure'),
        direct('assets/raw-traces/finalverify-044-song.txt', '183-turn 无证据猜测', '183-turn unsupported guess')
      ]
    },
    {
      expId: 'data-task-leakage-01',
      compareTo: 'data-outcome-verification-02',
      raw: [diagnostic('assets/raw-traces/finalverify-025-restaurant.txt', '用于检查 task/answer contract 的错误案例', 'Failure used to inspect the task/answer contract')]
    },
    {
      expId: 'data-outcome-verification-02',
      compareTo: 'data-task-leakage-01',
      raw: [diagnostic('assets/raw-traces/finalverify-000-ufc.txt', '不同搜索路径下的正确业务结果', 'Correct outcome through a valid alternative path')]
    },
    {
      expId: 'data-sft-conversion-05',
      compareTo: 'q30b-traceability-repair-synth',
      raw: [
        direct('assets/raw-traces/repair-000-correct.txt', '转换后的短正例', 'Converted short positive'),
        direct('assets/raw-traces/repair-050-wrong.txt', '格式正确但答案错误的反例', 'Format-valid but answer-wrong negative')
      ]
    },
    {
      expId: 'harness-context-compaction-01',
      compareTo: 'harness-ledger-hypothesis-02',
      raw: [
        diagnostic('assets/raw-traces/repair-126-253turn.txt', '253-turn context 压力案例', '253-turn context-pressure case'),
        diagnostic('assets/raw-traces/kimi-118-wrong-long.txt', '226-turn 长搜索恢复失败', '226-turn failed long-search recovery')
      ]
    },
    {
      expId: 'harness-ledger-hypothesis-02',
      compareTo: 'harness-final-self-verify-03',
      raw: [diagnostic('assets/raw-traces/repair-201-no-final.txt', '找到线索但未正确完成 finalization', 'Lead found but finalization not completed')]
    },
    {
      expId: 'harness-final-self-verify-03',
      compareTo: 'harness-ledger-hypothesis-02',
      raw: [
        diagnostic('assets/raw-traces/finalverify-000-ufc.txt', '证据充分后正确提交', 'Correct submission after sufficient evidence'),
        diagnostic('assets/raw-traces/finalverify-044-song.txt', '提交前未解决证据缺口', 'Evidence gap unresolved before submission')
      ]
    },
    {
      expId: 'infra-web-evidence-pipeline-01',
      compareTo: 'infra-stateful-sandbox-02',
      raw: [
        diagnostic('assets/raw-traces/repair-000-correct.txt', 'PDF 证据抓取成功', 'Successful PDF evidence extraction'),
        diagnostic('assets/raw-traces/repair-126-253turn.txt', '网页证据丢失导致过度搜索', 'Evidence loss followed by excessive search')
      ]
    },
    {
      expId: 'infra-stateful-sandbox-02',
      compareTo: 'infra-web-evidence-pipeline-01',
      raw: [diagnostic('assets/raw-traces/hardarb-007-wrong.txt', '多步 tool 状态与候选判断失败', 'Multi-step tool-state and arbitration failure')]
    },
    {
      expId: 'infra-eval-endpoint-recovery-03',
      compareTo: 'q30b-traceability-repair-synth',
      raw: [diagnostic('assets/raw-traces/kimi-110-correct-long.txt', '评测完成后可归档的原始 rollout', 'Archivable raw rollout after evaluation completion')]
    }
  ];
})();
