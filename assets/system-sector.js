(function () {
  const t = (zh, en) => ({ zh, en });

  window.AI4AI_SYSTEM_EXPERIMENTS = [
    {
      id: "harness-context-compaction-01",
      sector: "harness",
      title: t("用可回放压缩维持长搜索", "Keep long searches alive with replayable compaction"),
      hypothesis: t(
        "定期把已移出窗口的历史压缩成结构化状态，并在网页过大时先分块提取，可以在固定 context 和 turn budget 下减少中途终止，同时保留可诊断的搜索状态。",
        "Periodically compressing evicted history into structured state, while chunking oversized pages before they enter context, can reduce mid-trajectory termination under fixed context and turn budgets while preserving diagnosable search state."
      ),
      agents: [
        { role: "Trace Diagnostician", count: 3, focus: t("定位 context overflow 和证据丢失", "Locate context overflow and evidence loss") },
        { role: "Harness Engineer", count: 4, focus: t("实现结构化 compaction 与 append-only marker", "Implement structured compaction and append-only markers") },
        { role: "Replay Auditor", count: 2, focus: t("重建每一步模型实际看到的 prompt", "Reconstruct the exact prompt visible at every step") }
      ],
      stage: t("Record", "Record"),
      progress: 100,
      status: t("已接受", "Accepted"),
      metric: t("200/200 完成 · LLM judge 146/200 · 26 个 turn-limit 结束", "200/200 completed · LLM judge 146/200 · 26 turn-limit endings"),
      skill: "replayable-context-compaction",
      parent: "harness-keep-recent-k",
      activity: [
        t("诊断发现：盲目保留最近 k 个结果既会删除早期证据，也无法处理单个超大网页。", "Diagnosis: blindly keeping the most recent k results removes early evidence and still fails on a single oversized page."),
        t("Compaction 保存 confirmed facts、open hypotheses、rejected paths 和 search state。", "Compaction now preserves confirmed facts, open hypotheses, rejected paths, and search state."),
        t("Replay Auditor 已确认 context 操作可从 append-only trace 精确重建。", "The Replay Auditor confirmed that context operations can be reconstructed from the append-only trace.")
      ],
      artifact: t("结构化 context summary、完整原始 trace、prompt replay marker", "Structured context summaries, full raw traces, and prompt-replay markers"),
      provenance: "verified",
      provenanceLabel: t("论文归档实验", "Verified paper archive"),
      source: "§3.3 Harness archived Case 1 · AI4AI-case-harness.pdf",
      summary: t(
        "这次修改不是简单扩大窗口，而是在不改变模型和预算的情况下，让长轨迹继续运行，并保留失败归因所需的精确可见状态。",
        "This intervention does not enlarge the context window; it keeps long trajectories running under the same model and budgets while preserving the exact visible state needed for failure attribution."
      )
    },
    {
      id: "harness-ledger-hypothesis-02",
      sector: "harness",
      title: t("用两个失败实验排除证据保留假设", "Falsify the evidence-retention hypothesis with two failures"),
      hypothesis: t(
        "如果 found-but-not-submitted 主要来自证据遗忘，那么由 Harness 自动维护的候选摘要或由模型主动写入的 finding ledger，至少有一个应提高端到端正确率。",
        "If found-but-not-submitted failures are mainly caused by forgotten evidence, either a harness-maintained candidate summary or a model-written finding ledger should improve end-to-end correctness."
      ),
      agents: [
        { role: "Failure Analyst", count: 4, focus: t("定位找到但未提交的答案", "Locate answers that were found but never submitted") },
        { role: "Passive Memory Team", count: 3, focus: t("测试 Harness 维护的候选 notepad", "Test a harness-maintained candidate notepad") },
        { role: "Active Memory Team", count: 3, focus: t("测试模型主动调用的 finding ledger", "Test a model-triggered finding ledger") },
        { role: "Gate Reviewer", count: 2, focus: t("比较组件测试与端到端结果", "Compare component tests with end-to-end results") }
      ],
      stage: t("Review", "Review"),
      progress: 100,
      status: t("两条路线均拒绝", "Both routes rejected"),
      metric: t("组件恢复 5/5 遗漏答案 · 端到端 gate 未通过", "Component replay recovered 5/5 dropped answers · end-to-end gate failed"),
      skill: "negative-evidence-hypothesis-test",
      parent: "harness-context-compaction-01",
      activity: [
        t("Passive notepad 在离线 replay 中找回全部 5 个遗漏答案。", "The passive notepad recovered all five dropped answers in offline replay."),
        t("Active ledger 将模型确认的 lead 固定在 context 中，避免被 eviction 删除。", "The active ledger pinned model-confirmed leads in context so eviction could not remove them."),
        t("两种方案都没有通过端到端 gate，Research 将瓶颈从 retention 转向 finalization。", "Neither variant cleared the end-to-end gate, so Research moved the bottleneck from retention to finalization.")
      ],
      artifact: t("passive/active memory ablation、replay 对照、negative evidence", "Passive/active memory ablations, replay comparisons, and negative evidence"),
      provenance: "verified",
      provenanceLabel: t("论文验证案例", "Verified paper case"),
      source: "AI4AI-case-harness.pdf · Harness Case 2",
      summary: t(
        "这个节点展示 AI4AI 如何从失败中获得信息：两个看似合理的 memory 方案共同证明，问题不是答案没有被记住，而是提交前没有重新检查。",
        "This node shows how AI4AI learns from failure: two plausible memory designs jointly show that the answer was not lost; it was never re-checked before submission."
      )
    },
    {
      id: "harness-final-self-verify-03",
      sector: "harness",
      title: t("提交前按问题条件重新验证答案", "Re-verify the answer against task conditions before submission"),
      hypothesis: t(
        "在 finalization 阶段启动一个可使用原工具的 verifier，逐项检查问题条件，并只在明确矛盾时推翻候选答案，可以修复 found-but-not-submitted，而不会因证据不完整频繁误改答案。",
        "A tool-equipped verifier that checks each task condition at finalization and overturns a candidate only on explicit contradiction can repair found-but-not-submitted failures without over-correcting on incomplete evidence."
      ),
      agents: [
        { role: "Finalization Engineer", count: 3, focus: t("构造保守 self-verification 分支", "Build a conservative self-verification branch") },
        { role: "Verifier Agents", count: 6, focus: t("逐项检查原问题条件", "Check the original task conditions one by one") },
        { role: "Re-answer Agents", count: 3, focus: t("仅在明确失败时重新求解", "Re-solve only after an explicit failure") },
        { role: "Gate Reviewer", count: 2, focus: t("运行同配置 on/off 比较", "Run a matched on/off comparison") }
      ],
      stage: t("Record", "Record"),
      progress: 100,
      status: t("已接受并默认启用", "Accepted and enabled by default"),
      metric: t("LiveBrowseComp judge 145→163/335 · EM 92→112/335", "LiveBrowseComp judge 145→163/335 · EM 92→112/335"),
      skill: "conservative-final-self-verification",
      parent: "harness-ledger-hypothesis-02",
      activity: [
        t("Verifier 将原问题拆成必要条件，并使用完整 search toolset 逐项核对。", "The verifier decomposed the question into required conditions and checked each with the full search toolset."),
        t("只有明确条件失败、可靠证据矛盾或实体/数值错误才触发 re-answer。", "Re-answer is triggered only by an explicit condition failure, reliable contradiction, or wrong entity or value."),
        t("Matched LiveBrowseComp gate 通过，修改进入默认 Harness。", "The matched LiveBrowseComp gate passed and the intervention entered the default harness.")
      ],
      artifact: t("self-verification trace、严格 JSON verdict、bounded re-answer log", "Self-verification traces, strict JSON verdicts, and bounded re-answer logs"),
      provenance: "verified",
      provenanceLabel: t("论文验证案例", "Verified paper case"),
      source: "§3.3 Harness archived Case 2 · AI4AI-case-harness.pdf",
      summary: t(
        "失败的 memory 实验改变了研究方向，最终修改作用在真正的瓶颈 finalization，并通过同配置端到端对照。",
        "The failed memory experiments redirected the search to the actual bottleneck—finalization—where the accepted change passed a matched end-to-end comparison."
      )
    },
    {
      id: "eval-benchmark-scoped-normalization-01",
      sector: "evaluation",
      title: t("把评分对齐限制在对应 benchmark", "Scope grading alignment to the benchmark that validates it"),
      hypothesis: t(
        "对 set-valued task 使用逐项 F1，并把 unambiguous alias normalization 限制在验证过的 benchmark，可以让评分反映任务定义，同时避免把 grader 变化误报为模型能力提升。",
        "Using per-item F1 for set-valued tasks and restricting unambiguous-alias normalization to the benchmark that validates it can align scoring with task intent without reporting grader changes as model gains."
      ),
      agents: [
        { role: "Evaluation Designer", count: 3, focus: t("定义 benchmark-specific metric", "Define benchmark-specific metrics") },
        { role: "Normalization Auditor", count: 4, focus: t("审核可接受 alias 与歧义缩写", "Audit acceptable aliases and ambiguous abbreviations") },
        { role: "Leakage Reviewer", count: 2, focus: t("确认规则不访问隐藏答案", "Confirm that rules do not access hidden answers") }
      ],
      stage: t("Review", "Review"),
      progress: 88,
      status: t("限定范围启用", "Enabled with benchmark scope"),
      metric: t("DeepSearchQA 写入独立 dsqa_f1_* 结果 · 其他 benchmark 默认关闭", "Separate dsqa_f1_* results for DeepSearchQA · disabled elsewhere by default"),
      skill: "benchmark-scoped-grading-alignment",
      parent: "harness-final-self-verify-03",
      activity: [
        t("Evaluation Designer 将行为分数与 grading-alignment 分数写入不同 artifact。", "The Evaluation Designer separated behavior scores from grading-alignment artifacts."),
        t("Normalization Auditor 接受明确同义名，拒绝可能指向其他实体的缩写。", "The Normalization Auditor accepts unambiguous aliases and rejects abbreviations that may denote another entity."),
        t("规则只在完成验证的 benchmark 上默认启用。", "The rule is enabled by default only on the benchmark where it was validated.")
      ],
      artifact: t("版本化 normalization rule、accepted/rejected 样例、独立 F1 artifact", "Versioned normalization rules, accepted/rejected examples, and separate F1 artifacts"),
      provenance: "reconstructed",
      provenanceLabel: t("基于论文实现重构", "Reconstructed from the paper implementation"),
      source: "§3.3 Harness Case 2 · §5.6 Evaluation-protocol alignment",
      summary: t(
        "这个实验不改变 Agent 能做什么，而是确保同一个答案被公平计分，并让任何分数变化都能区分行为改进与评分规则变化。",
        "This experiment does not change what the agent can do; it ensures equivalent answers are scored fairly and separates behavior gains from grading-rule changes."
      )
    },
    {
      id: "eval-bounded-exploration-diagnostics-02",
      sector: "evaluation",
      title: t("识别搜索何时从探索变成失控恢复", "Detect when exploration turns into failed recovery"),
      hypothesis: t(
        "如果超长轨迹主要代表低效恢复而不是更深入的推理，那么失败 trace 应显著长于成功 trace，且 accuracy 会在高 turn bucket 中下降。",
        "If very long trajectories mostly reflect inefficient recovery rather than deeper reasoning, failed traces should be substantially longer than successful ones and accuracy should decline in high-turn buckets."
      ),
      agents: [
        { role: "Trace Statistician", count: 5, focus: t("比较成功与失败的 turn 分布", "Compare turn distributions for successful and failed traces") },
        { role: "Tool-use Analyst", count: 4, focus: t("按 benchmark 分解 search/scrape/python", "Decompose search, scrape, and Python use by benchmark") },
        { role: "Evaluation Reviewer", count: 2, focus: t("检查小样本 bucket 与异常值", "Review small-count buckets and outliers") }
      ],
      stage: t("Record", "Record"),
      progress: 100,
      status: t("诊断完成", "Diagnostic complete"),
      metric: t("BrowseComp 失败 median 约为成功的 3× · 多个 benchmark 在 150+ turns 后 accuracy 明显下降", "BrowseComp failed median ≈3× successful median · accuracy drops sharply beyond 150 turns on multiple benchmarks"),
      skill: "bounded-exploration-diagnostics",
      parent: "eval-fixed-external-suite",
      activity: [
        t("统计显示 BrowseComp-ZH 与 LiveBrowseComp 的失败 median 也超过成功 trace 的 2×。", "Statistics show failed medians above 2× successful traces on BrowseComp-ZH and LiveBrowseComp as well."),
        t("Tool-use 分解发现 browsing benchmark 以 search 为主，GAIA/DeepSearchQA 使用更多 extraction 和 Python。", "Tool-use analysis shows browsing benchmarks are search-heavy, while GAIA and DeepSearchQA use more extraction and Python."),
        t("Review 结论：不能把统一的 search-more 策略应用到所有 benchmark。", "Review conclusion: a single search-more policy should not be applied across benchmarks.")
      ],
      artifact: t("turn distribution、accuracy-by-turn bucket、跨 benchmark tool-use profile", "Turn distributions, accuracy-by-turn buckets, and cross-benchmark tool-use profiles"),
      provenance: "verified",
      provenanceLabel: t("论文评测结果", "Verified paper evaluation"),
      source: "§6 Cross-Benchmark Analysis · three trace-level figures",
      summary: t(
        "这个诊断把“搜索越长越好”改写为可检验的 stopping 问题：不同 benchmark 需要不同 tool mix，而异常长轨迹通常是失败信号。",
        "This diagnostic turns “search longer” into a testable stopping problem: benchmarks require different tool mixes, and unusually long trajectories are usually a failure signal."
      )
    },
    {
      id: "infra-web-evidence-pipeline-01",
      sector: "infrastructure",
      title: t("让网页从抓取到摘要都保留决定性证据", "Preserve decisive evidence from page fetch through summarization"),
      hypothesis: t(
        "对可直接读取的页面绕过不稳定 proxy，对超长网页执行分块提取与合并，并要求最终摘要连接来源与结论，可以在不改变 scrape tool 语义的情况下减少空结果和证据丢失。",
        "Bypassing an unstable proxy for directly readable pages, applying chunked extraction and merge to oversized pages, and requiring the final summary to connect sources to conclusions can reduce empty results and evidence loss without changing scrape-tool semantics."
      ),
      agents: [
        { role: "Fetch Router", count: 4, focus: t("选择 direct fetch 或 Jina 路径", "Choose direct-fetch or Jina routes") },
        { role: "Extraction Agents", count: 8, focus: t("并行处理超长网页 chunk", "Process oversized page chunks in parallel") },
        { role: "Evidence Merger", count: 3, focus: t("合并带来源的 evidence chain", "Merge a source-linked evidence chain") },
        { role: "Guardrail Reviewer", count: 2, focus: t("拒绝 benchmark keyword shortcut", "Reject benchmark-keyword shortcuts") }
      ],
      stage: t("Dev", "Dev"),
      progress: 72,
      status: t("端到端 gate 中", "Running end-to-end gate"),
      metric: t("固定 frozen-source benchmark · 不声明未隔离的 score delta", "Fixed frozen-source benchmark · no unisolated score delta claimed"),
      skill: "source-faithful-map-reduce-extraction",
      parent: "infra-single-pass-jina-summary",
      activity: [
        t("Router 正在绕过对直接可读页面和 document URL 的失败 proxy 路径。", "The router is bypassing failed proxy paths for directly readable pages and document URLs."),
        t("超长网页被切分后使用同一 evidence-preservation prompt 并行提取。", "Oversized pages are chunked and extracted in parallel under one evidence-preservation prompt."),
        t("Guardrail Reviewer 已拒绝只针对 benchmark keyword 的 shortcut。", "The Guardrail Reviewer rejected a shortcut that targeted benchmark keywords.")
      ],
      artifact: t("scrape routing log、chunk extraction、source-linked summary、guardrail decision", "Scrape-routing logs, chunk extractions, source-linked summaries, and guardrail decisions"),
      provenance: "reconstructed",
      provenanceLabel: t("论文真实组件的组合重构", "Reconstructed from real paper components"),
      source: "§3.3 Infrastructure case · §5.6 Tool backend evolution",
      summary: t(
        "该节点把三个常被误认为模型失败的问题连成一个可诊断链路：页面取不到、长页面摘要漏证据、摘要没有说明结论来自哪里。",
        "This node connects three failures often misattributed to the model: an unreadable page, decisive evidence lost in a long-page summary, and a summary that does not connect its conclusion to a source."
      )
    },
    {
      id: "infra-stateful-sandbox-02",
      sector: "infrastructure",
      title: t("为每个 task 保留一个有状态执行 sandbox", "Keep one stateful execution sandbox per task"),
      hypothesis: t(
        "在同一 task 内保留 imports、variables、files 和 working directory，并在一个受限 backend 中支持 Python 与必要 shell 操作，可以减少由每次重建环境造成的 tool failure，而不增加新的 Agent tool。",
        "Preserving imports, variables, files, and the working directory within a task, while supporting Python and bounded shell operations in one backend, can reduce tool-layer failures caused by rebuilding the environment without adding a new agent-facing tool."
      ),
      agents: [
        { role: "Sandbox Engineer", count: 4, focus: t("实现 per-task persistent state", "Implement persistent per-task state") },
        { role: "Tool Contract Auditor", count: 2, focus: t("保持 Agent 侧仍只有 python tool", "Keep a single agent-facing Python tool") },
        { role: "Security Reviewer", count: 3, focus: t("检查 network、hidden data 和 timeout 边界", "Audit network, hidden-data, and timeout boundaries") }
      ],
      stage: t("Review", "Review"),
      progress: 84,
      status: t("安全审核中", "Security review"),
      metric: t("状态跨调用保留 · tool contract 不变 · network/hidden benchmark 禁止", "State persists across calls · tool contract unchanged · network and hidden benchmarks prohibited"),
      skill: "stateful-bounded-code-execution",
      parent: "infra-fresh-sandbox-per-call",
      activity: [
        t("相同 task 的后续调用可以继续使用前一步创建的 file、variable 和 dependency。", "Later calls in the same task can reuse files, variables, and dependencies created earlier."),
        t("直接 shell 仅作为现有 python tool 的 backend execution mode，不向 Agent 暴露第四个 tool。", "Direct shell is an execution mode of the existing Python-tool backend, not a fourth agent-facing tool."),
        t("Security Reviewer 正在验证 timeout、stdout/stderr、working directory 和 state transition 日志。", "The Security Reviewer is validating timeout, stdout/stderr, working-directory, and state-transition logs.")
      ],
      artifact: t("per-task sandbox snapshot、execution log、tool-contract 与安全审核", "Per-task sandbox snapshots, execution logs, and tool-contract/security reviews"),
      provenance: "reconstructed",
      provenanceLabel: t("基于论文实现重构", "Reconstructed from the paper implementation"),
      source: "§5.6 Tool backend evolution · §6 Evaluation Protocol",
      summary: t(
        "这项修改修复的是执行环境而不是模型推理：同一分析无需在每个 tool call 中重新创建文件、安装依赖和恢复变量。",
        "This intervention repairs the execution environment rather than model reasoning: an analysis no longer has to recreate files, dependencies, and variables on every tool call."
      )
    },
    {
      id: "infra-eval-endpoint-recovery-03",
      sector: "infrastructure",
      title: t("将 endpoint 故障隔离为可恢复的评测阻塞", "Quarantine endpoint failure as a recoverable evaluation block"),
      hypothesis: t(
        "当 search endpoint 或 key 无法支持真实 benchmark traffic 时，系统应拒绝生成模型结论，保留 checkpoint 与原始日志，并从最后一个持久 artifact 恢复同一评测。",
        "When a search endpoint or key cannot support realistic benchmark traffic, the system should withhold a model conclusion, preserve the checkpoint and raw logs, and resume the same evaluation from the last durable artifact."
      ),
      agents: [
        { role: "Endpoint Monitor", count: 3, focus: t("区分搜索服务失败与模型失败", "Separate search-service failures from model failures") },
        { role: "Completion Validator", count: 2, focus: t("拒绝缺少 metrics/log/trace 的完成状态", "Reject completion states missing metrics, logs, or traces") },
        { role: "Recovery Agent", count: 4, focus: t("从 checkpoint 和持久 artifact 重启", "Resume from checkpoints and durable artifacts") },
        { role: "Hub Manager", count: 1, focus: t("归档 blocker fingerprint 与重试条件", "Archive blocker fingerprints and retry conditions") }
      ],
      stage: t("Record", "Record"),
      progress: 100,
      status: t("安全阻塞，等待 endpoint", "Safely blocked pending endpoint"),
      metric: t("未生成无效 score · checkpoint-123 保留 · 需要同 protocol 重跑", "No invalid score emitted · checkpoint-123 preserved · same-protocol rerun required"),
      skill: "durable-eval-recovery",
      parent: "q30b-softrepair-scrape-stoplock",
      activity: [
        t("评测因 Serper-compatible endpoint/key 不可用而停止，failure_source 记录为 eval_infra。", "Evaluation stopped because the Serper-compatible endpoint/key was unavailable; failure_source was recorded as eval_infra."),
        t("Completion Validator 会拒绝把缺少真实 AXRL log 和 rollout trace 的 FINISHED 状态推进到 Review。", "The Completion Validator rejects a FINISHED state without readable AXRL logs and rollout traces."),
        t("Recovery policy 保留 checkpoint-123，并要求 endpoint 恢复后按原 scoring 和 subset 重跑。", "The recovery policy preserves checkpoint-123 and requires a rerun with the original scoring and subset after endpoint recovery.")
      ],
      artifact: t("blocker fingerprint、checkpoint pointer、recovery request、durable eval log/trace path", "Blocker fingerprints, checkpoint pointers, recovery requests, and durable eval log/trace paths"),
      provenance: "reconstructed",
      provenanceLabel: t("基于真实归档与运行时代码重构", "Reconstructed from a verified archive and runtime code"),
      source: "repo_meta commit cee7e10 / leaderboard workspace 818d · scenarios/post_train/recovery.py",
      summary: t(
        "自动化最重要的不只是继续运行，还包括知道何时不能给出结论：基础设施失败被单独归档，训练结果和重试条件都不会丢失。",
        "Automation is not only about continuing to run; it must know when no conclusion is valid. Infrastructure failure is archived separately without losing the trained result or the exact retry conditions."
      )
    }
  ];
})();
