(function () {
  const t = (zh, en) => ({ zh, en });

  window.AI4AI_DATA_EXPERIMENTS = [
    {
      id: "data-task-leakage-01",
      title: t("删除任务中的答案泄露", "Remove answer leakage from tasks"),
      hypothesis: t(
        "如果 task 只保留用户问题和必要背景，而不写出预期处理方式，模型必须依据 Env 中的证据完成任务，错误轨迹将不再被误判为可训练数据。",
        "If a task keeps only the user request and necessary context instead of stating the expected handling decision, the model must solve it from evidence in the Env and invalid traces will no longer be admitted as training data."
      ),
      agents: [
        { role: "Task Auditor", count: 3, focus: t("定位泄露处理结果的字段", "Locate fields that reveal the expected outcome") },
        { role: "Env Runner", count: 6, focus: t("重新生成购物场景 rollout", "Regenerate shopping-scenario rollouts") },
        { role: "Trace Reviewer", count: 2, focus: t("复核 Pass 与 Failed trace", "Review both Pass and Failed traces") }
      ],
      stage: t("Record", "Record"),
      progress: 100,
      status: t("已接受", "Accepted"),
      metric: {
        name: t("数据准入错误", "Admission errors"),
        value: "FP 0.22 → 0 · FN 0.10 → 0.10",
        interpretation: t("答案泄露已消除，仍有正确轨迹被 Env 拒绝。", "Answer leakage is removed, but some valid traces are still rejected by the Env.")
      },
      skill: t("Task Leakage Audit", "Task Leakage Audit"),
      parent: "data-shopping-baseline",
      activity: [
        { actor: "Task Auditor", text: t("发现 task 直接要求推荐其他有效促销并保持订单不变。", "Found that the task directly required recommending another active promotion and leaving the order unchanged."), state: "done" },
        { actor: "Env Runner", text: t("删除处理结果后重新运行 rollout。", "Regenerated rollouts after removing the handling result."), state: "done" },
        { actor: "Trace Reviewer", text: t("确认 FP 清零，并把剩余 FN 归因到固定 tool sequence。", "Confirmed that FP reached zero and attributed the remaining FN to a fixed tool sequence."), state: "done" }
      ],
      artifact: t("去泄露的 task 集、原始 rollout、FP/FN 审核记录", "De-leaked task set, raw rollouts, and FP/FN review records"),
      provenance: {
        type: "verified",
        label: t("论文验证案例", "Verified paper case"),
        source: "AI4AI-case-data.pdf · Data construction Step 1",
        note: t("问题、修改和 FP/FN 数值均直接来自最新版论文图。", "The issue, intervention, and FP/FN values come directly from the latest paper figure.")
      },
      summary: t(
        "这次实验把“模型照着答案做”与“模型真正完成任务”区分开，并暴露了下一层 Env Verification 问题。",
        "This experiment separates following leaked instructions from actually solving the task, and exposes the next Env Verification failure."
      )
    },
    {
      id: "data-outcome-verification-02",
      title: t("验证业务结果，而不是固定 tool sequence", "Verify outcomes, not a fixed tool sequence"),
      hypothesis: t(
        "只检查最终业务结果、必要提交和禁止操作，可以接受多条有效 tool path，同时继续拒绝错误 FAQ、订单修改和未提交的结果。",
        "Checking the final business outcome, required submission, and prohibited actions should admit multiple valid tool paths while still rejecting a wrong FAQ, an order update, or a missing submission."
      ),
      agents: [
        { role: "Verifier Engineer", count: 2, focus: t("移除固定调用顺序", "Remove fixed call-order checks") },
        { role: "Path Explorer", count: 8, focus: t("生成不同但有效的 tool path", "Generate distinct valid tool paths") },
        { role: "Adversarial Reviewer", count: 3, focus: t("确认禁止操作仍被拒绝", "Confirm that prohibited actions remain rejected") }
      ],
      stage: t("Record", "Record"),
      progress: 100,
      status: t("已接受", "Accepted"),
      metric: {
        name: t("数据准入错误", "Admission errors"),
        value: "FP 0 → 0 · FN 0.10 → 0",
        interpretation: t("有效替代路径不再被拒绝，错误结果仍无法通过。", "Valid alternative paths are no longer rejected, while incorrect outcomes still fail.")
      },
      skill: t("Outcome-based Env Verification", "Outcome-based Env Verification"),
      parent: "data-task-leakage-01",
      activity: [
        { actor: "Path Explorer", text: t("找到结果相同但 tool 顺序不同的有效轨迹。", "Found valid traces with the same outcome but different tool sequences."), state: "done" },
        { actor: "Verifier Engineer", text: t("将检查目标从中间路径改为最终结果和禁止操作。", "Moved verification from the intermediate path to the final outcome and prohibited actions."), state: "done" },
        { actor: "Adversarial Reviewer", text: t("错误 FAQ、update_order 和未提交轨迹仍被拒绝。", "A wrong FAQ, update_order, and an unsubmitted trace are still rejected."), state: "done" }
      ],
      artifact: t("结果导向的 Env Verification、有效路径测试集、禁止操作测试集", "Outcome-based Env Verification, valid-path tests, and prohibited-action tests"),
      provenance: {
        type: "verified",
        label: t("论文验证案例", "Verified paper case"),
        source: "AI4AI-case-data.pdf · Data construction Step 2",
        note: t("FP/FN 变化及固定 tool sequence 问题来自最新版论文图。", "The FP/FN change and fixed-tool-sequence issue come from the latest paper figure.")
      },
      summary: t(
        "Env 不再规定模型必须怎样完成任务，只规定什么结果正确、什么操作不允许。",
        "The Env no longer dictates how the model must complete the task; it defines which outcomes are correct and which actions are prohibited."
      )
    },
    {
      id: "data-env-contract-03",
      title: t("审计 Env 的公开接口与私有规则", "Audit the Env public–private contract"),
      hypothesis: t(
        "如果 task 需要的信息没有通过公开 tool 暴露，或私有验证依赖未公开字段，模型即使采取合理操作也会产生 FN。",
        "If information required by a task is unavailable through public tools, or private verification depends on undisclosed fields, reasonable model behavior will produce false negatives."
      ),
      agents: [
        { role: "Contract Inspector", count: 4, focus: t("对齐 tool schema、runtime rule 和 verification", "Align tool schemas, runtime rules, and verification") },
        { role: "Task Solver", count: 10, focus: t("仅使用公开接口尝试完成 task", "Attempt tasks using only public interfaces") },
        { role: "Failure Attributor", count: 3, focus: t("区分模型失败与接口失败", "Separate model failures from interface failures") }
      ],
      stage: t("Review", "Review"),
      progress: 76,
      status: t("正在审计", "Auditing"),
      metric: {
        name: t("目标", "Target"),
        value: "public-contract coverage → 100%",
        interpretation: t("不展示虚构实验分数；当前检查所有私有条件是否有公开证据。", "No fabricated experiment score is shown; the current check asks whether every private condition has public evidence.")
      },
      skill: t("Env Contract Linter", "Env Contract Linter"),
      parent: "data-outcome-verification-02",
      activity: [
        { actor: "Contract Inspector", text: t("建立 task requirement 到公开 tool field 的映射。", "Mapped every task requirement to a public tool field."), state: "done" },
        { actor: "Task Solver", text: t("并行重放只使用公开信息的解决路径。", "Replaying solution paths using public information only."), state: "active" },
        { actor: "Failure Attributor", text: t("等待分析无法从公开状态推导的 verification 条件。", "Waiting to analyze verification conditions not derivable from public state."), state: "queued" }
      ],
      artifact: t("Env contract matrix、不可见依赖报告、最小复现 trace", "Env contract matrix, hidden-dependency report, and minimal reproduction traces"),
      provenance: {
        type: "reconstructed",
        label: t("基于论文方法重构", "Reconstructed from the paper method"),
        source: "§3.3 Data construction · environment-interface FN example",
        note: t("审计方向来自正文；并行规模和产品工作流用于 Demo 重构。", "The audit direction comes from the paper; concurrency and product workflow are reconstructed for the demo.")
      },
      summary: t(
        "该实验检查失败究竟来自模型能力，还是 Env 要求模型满足一个它根本看不到的条件。",
        "This experiment tests whether a failure reflects model capability or an Env condition the model could never observe."
      )
    },
    {
      id: "data-failure-attribution-04",
      title: t("把 Failed trace 分解为可修复原因", "Attribute Failed traces to repairable causes"),
      hypothesis: t(
        "将失败归因到 task、Env、rollout 或 conversion，可以把统一的 Failed 标签转化为下一轮可执行修改。",
        "Attributing failures to the task, Env, rollout, or conversion can turn a generic Failed label into an actionable next intervention."
      ),
      agents: [
        { role: "Trace Clusterer", count: 12, focus: t("按失败行为聚类 rollout", "Cluster rollouts by failure behavior") },
        { role: "Root-cause Reviewer", count: 5, focus: t("审核自动归因", "Review automated attribution") },
        { role: "Research Planner", count: 2, focus: t("将原因转为下一轮实验", "Turn causes into next experiments") }
      ],
      stage: t("Review", "Review"),
      progress: 61,
      status: t("分析中", "Analyzing"),
      metric: {
        name: t("归因覆盖率", "Attribution coverage"),
        value: "target ≥ 95%",
        interpretation: t("衡量有多少失败能连接到一个明确的修复位置，而不是模型准确率。", "Measures how many failures map to a concrete repair location, not model accuracy.")
      },
      skill: t("Trace Root-Cause Attribution", "Trace Root-Cause Attribution"),
      parent: "data-env-contract-03",
      activity: [
        { actor: "Trace Clusterer", text: t("正在比较 Pass/Failed pair 的最后一个状态分叉。", "Comparing the final state divergence in Pass/Failed pairs."), state: "active" },
        { actor: "Root-cause Reviewer", text: t("发现部分相同错误标签实际包含两种不同原因。", "Found that one error label contains two distinct root causes."), state: "active" },
        { actor: "Research Planner", text: t("准备为高频原因创建独立 experiment branch。", "Preparing separate experiment branches for frequent causes."), state: "queued" }
      ],
      artifact: t("失败分类树、Pass/Failed 对照 trace、下一轮实验队列", "Failure taxonomy, paired Pass/Failed traces, and next-experiment queue"),
      provenance: {
        type: "simulation",
        label: t("产品能力模拟", "Product simulation"),
        source: "Derived from the paper's case-level review workflow",
        note: t("失败归因符合论文流程；活动状态和目标值用于产品演示。", "Failure attribution follows the paper workflow; activity states and targets are product simulation.")
      },
      summary: t(
        "系统不会把所有失败都归咎于模型，而是自动决定下一轮应该改 task、Env、rollout 还是 conversion。",
        "The system does not blame every failure on the model; it determines whether the next iteration should change the task, Env, rollout, or conversion."
      )
    },
    {
      id: "data-sft-conversion-05",
      title: t("把 768 条证据修复轨迹安全转换为 SFT", "Safely convert 768 evidence-repair traces to SFT"),
      hypothesis: t(
        "证据修复产生的 provenance 可以保存在 sidecar，而训练 row 只保留稳定的 Hermes schema；同时修复孤立 tool call，避免数据内容正确却在加载或训练时失败。",
        "Evidence-repair provenance can be preserved in a sidecar while training rows retain a stable Hermes schema; orphan tool calls can be repaired so semantically useful data does not fail during loading or training."
      ),
      agents: [
        { role: "Repair Synthesizer", count: 8, focus: t("生成 evidence-stop、candidate arbitration 和 query reformulation 轨迹", "Generate evidence-stop, candidate-arbitration, and query-reformulation traces") },
        { role: "Schema Guard", count: 3, focus: t("检查 Hermes message alternation 与 tool pairing", "Check Hermes message alternation and tool pairing") },
        { role: "Data Reviewer", count: 4, focus: t("审核生成、拒绝和来源记录", "Review generation, rejection, and provenance records") }
      ],
      stage: t("Record", "Record"),
      progress: 100,
      status: t("Data gate 已通过", "Data gate passed"),
      metric: {
        name: t("转换结果", "Conversion result"),
        value: "9,311 seed + 768 repair = 10,079 rows · invalid Hermes rows: 0",
        interpretation: t("768 条修复轨迹平均覆盖三类行为，训练 schema 验证全部通过。", "The 768 repair traces are balanced across three behaviors, and all training-schema validation gates pass.")
      },
      skill: t("Traceability Repair + Hermes Schema Guard", "Traceability Repair + Hermes Schema Guard"),
      parent: "proc_exp13_softrepair_scrape_window_30b",
      activity: [
        { actor: "Repair Synthesizer", text: t("选出 256 条 evidence-seen stop、256 条 candidate arbitration 和 256 条 traceable reformulation。", "Selected 256 evidence-seen-stop, 256 candidate-arbitration, and 256 traceable-reformulation traces."), state: "done" },
        { actor: "Schema Guard", text: t("发现 SearchAgent_1052 的孤立 google_search call，并补入空 tool response 恢复合法交替。", "Found an orphan google_search call in SearchAgent_1052 and inserted an empty tool response to restore valid alternation."), state: "done" },
        { actor: "Data Reviewer", text: t("从训练 row 移除 synthetic metadata，并把完整 provenance 保存到 sidecar。", "Removed synthetic metadata from training rows and preserved full provenance in a sidecar."), state: "done" },
        { actor: "Schema Guard", text: t("Hermes schema、boxed answer、262K tokenizer、GPU loading 和 prompt leakage 检查全部通过。", "Hermes schema, boxed-answer, 262K-tokenizer, GPU-loading, and prompt-leakage checks all passed."), state: "done" }
      ],
      artifact: t("10,079-row SFT payload、768-row repair set、manifest、features、reviews 和 provenance sidecar", "10,079-row SFT payload, 768-row repair set, manifest, features, reviews, and provenance sidecar"),
      provenance: {
        type: "verified",
        label: t("服务器真实 artifact", "Verified server artifact"),
        source: "research_hub commit 91ea37b · proc_traceability_repair_synth_a6a3db03-c73d-47a8-b199-1684daeb7523",
        note: t("row 数、三类配额、孤立 tool call 修复和 validation gates 均来自服务器 README 与 manifest；演示中的 agent 并发仅为产品重演。", "Row counts, three-way quotas, orphan-tool-call repair, and validation gates come from the server README and manifest; agent concurrency is a product replay.")
      },
      summary: t(
        "这个真实实验把内容修复、schema 修复和 provenance 分离：训练 row 保持干净，但每次生成与审核决定仍可追溯。",
        "This real experiment separates content repair, schema repair, and provenance: training rows stay clean while every generation and review decision remains traceable."
      )
    },
    {
      id: "data-verifier-redteam-06",
      title: t("对 Env Verification 做对抗测试", "Red-team Env Verification"),
      hypothesis: t(
        "为同一 task 构造结果相近的正确与错误 trace，可以同时发现 verifier 过宽造成的 FP 和过严造成的 FN。",
        "Constructing similar correct and incorrect traces for the same task can expose both false positives from permissive verification and false negatives from over-strict verification."
      ),
      agents: [
        { role: "Adversarial Generator", count: 16, focus: t("生成最小差异的 trace pair", "Generate minimally different trace pairs") },
        { role: "Env Verifier", count: 6, focus: t("运行隔离验证", "Run isolated verification") },
        { role: "Boundary Reviewer", count: 3, focus: t("审核 FP/FN 边界", "Review FP/FN boundaries") }
      ],
      stage: t("Dev", "Dev"),
      progress: 43,
      status: t("正在生成反例", "Generating counterexamples"),
      metric: {
        name: t("验证边界", "Verification boundary"),
        value: "FP target 0 · FN target 0",
        interpretation: t("正确与错误 pair 只改变一个业务条件，检验 Env 是否真正检查该条件。", "Each correct/incorrect pair changes one business condition to test whether the Env actually checks it.")
      },
      skill: t("Verifier Counterexample Generation", "Verifier Counterexample Generation"),
      parent: "data-outcome-verification-02",
      activity: [
        { actor: "Adversarial Generator", text: t("正在改变最终结果，同时保持 tool path 和输出格式相似。", "Changing the final outcome while keeping tool paths and output formats similar."), state: "active" },
        { actor: "Env Verifier", text: t("并行检查等价格式与真实业务错误。", "Checking equivalent formats and genuine business errors in parallel."), state: "active" },
        { actor: "Boundary Reviewer", text: t("等待高不确定性 pair。", "Waiting for high-uncertainty pairs."), state: "queued" }
      ],
      artifact: t("正确/错误 trace pair、verification confusion matrix、最小反例", "Correct/incorrect trace pairs, verification confusion matrix, and minimal counterexamples"),
      provenance: {
        type: "simulation",
        label: t("产品能力模拟", "Product simulation"),
        source: "Extended from the paper's FP/FN review protocol",
        note: t("FP/FN 目标来自论文定义；自动生成对抗 pair 是产品化扩展。", "The FP/FN objective follows the paper definition; automated adversarial pairs are a product extension.")
      },
      summary: t(
        "系统主动寻找“看起来几乎一样、但一个应该通过、一个应该失败”的轨迹，测试验证边界是否可靠。",
        "The system searches for traces that look nearly identical but should receive opposite labels, directly testing the reliability of the verification boundary."
      )
    },
    {
      id: "data-task-difficulty-07",
      title: t("把任务难度放在推理，而不是歧义里", "Put task difficulty in reasoning, not ambiguity"),
      hypothesis: t(
        "补齐完成任务所需的公开信息，同时保留多步决策要求，可以减少由措辞不清产生的失败，而不把任务变成简单提示题。",
        "Providing all public information needed to solve a task while preserving multi-step decisions can reduce failures caused by ambiguity without turning the task into an answer hint."
      ),
      agents: [
        { role: "Task Designer", count: 7, focus: t("构造信息完整但不泄露答案的 task", "Create complete tasks without leaking answers") },
        { role: "Leakage Critic", count: 5, focus: t("寻找过强线索", "Search for overly strong clues") },
        { role: "Solvability Tester", count: 12, focus: t("测试公开信息是否足够", "Test whether public information is sufficient") }
      ],
      stage: t("Research", "Research"),
      progress: 32,
      status: t("假设筛选中", "Screening hypotheses"),
      metric: {
        name: t("双重门槛", "Dual gate"),
        value: "solvable without leakage",
        interpretation: t("task 必须既能由公开信息解出，又不能直接写出处理结果。", "A task must be solvable from public information without directly stating the handling outcome.")
      },
      skill: t("Task Solvability–Leakage Balance", "Task Solvability–Leakage Balance"),
      parent: "data-task-leakage-01",
      activity: [
        { actor: "Task Designer", text: t("比较同一业务状态的三种 task 表述。", "Comparing three task formulations for the same business state."), state: "active" },
        { actor: "Leakage Critic", text: t("标记能够直接推出操作结果的短语。", "Flagging phrases that directly reveal the required action."), state: "active" },
        { actor: "Solvability Tester", text: t("准备只使用公开 tool 的 blind solve。", "Preparing blind solves using public tools only."), state: "queued" }
      ],
      artifact: t("task 对照集、leakage 标注、solvability review", "Task contrast set, leakage annotations, and solvability review"),
      provenance: {
        type: "simulation",
        label: t("产品能力模拟", "Product simulation"),
        source: "Extended from task leakage and underspecification findings in the report",
        note: t("问题类型来自论文，具体实验设计与运行状态为产品模拟。", "The failure types come from the report; the experiment design and runtime state are product simulation.")
      },
      summary: t(
        "目标不是把 task 写得更容易，而是确保难度来自真实决策，而不是缺失信息或答案泄露。",
        "The goal is not to make tasks easier, but to ensure difficulty comes from real decision-making rather than missing information or answer leakage."
      )
    },
    {
      id: "data-cross-env-transfer-08",
      title: t("把 Data 修复迁移到新的 Env", "Transfer Data repairs across Envs"),
      hypothesis: t(
        "如果 task leakage、接口依赖和 outcome verification 的修复原则可复用，它们应当在不同业务 Env 中降低相同类型的 FP/FN，而无需复制购物场景的具体规则。",
        "If the repair principles for task leakage, interface dependencies, and outcome verification are reusable, they should reduce the same FP/FN classes across business Envs without copying shopping-specific rules."
      ),
      agents: [
        { role: "Transfer Planner", count: 3, focus: t("提取与领域无关的修复规则", "Extract domain-independent repair rules") },
        { role: "Env Builder", count: 12, focus: t("在多个模拟 Env 中实现规则", "Implement rules in multiple simulated Envs") },
        { role: "Generalization Reviewer", count: 4, focus: t("检查是否过拟合购物案例", "Check for overfitting to the shopping case") }
      ],
      stage: t("Research", "Research"),
      progress: 18,
      status: t("等待资源", "Awaiting resources"),
      metric: {
        name: t("跨 Env 迁移", "Cross-Env transfer"),
        value: "planned",
        interpretation: t("只迁移验证原则，不迁移购物场景的隐藏答案或固定字段。", "Transfer verification principles only, not shopping-specific hidden answers or fixed fields.")
      },
      skill: t("Cross-Env Data Quality Playbook", "Cross-Env Data Quality Playbook"),
      parent: "data-verifier-redteam-06",
      activity: [
        { actor: "Transfer Planner", text: t("正在把购物案例规则抽象为通用不变量。", "Abstracting shopping-case repairs into general invariants."), state: "active" },
        { actor: "Env Builder", text: t("等待可用的下一批 Env。", "Waiting for the next available Envs."), state: "queued" },
        { actor: "Generalization Reviewer", text: t("准备检查跨 Env 的 FP/FN 定义一致性。", "Preparing to check consistent FP/FN definitions across Envs."), state: "queued" }
      ],
      artifact: t("跨 Env 修复模板、迁移检查表、generalization report", "Cross-Env repair templates, transfer checklist, and generalization report"),
      provenance: {
        type: "simulation",
        label: t("产品能力模拟", "Product simulation"),
        source: "Product-scale extension of the verified Data case",
        note: t("展示 AI4AI 可扩展能力，不代表论文已报告跨 Env 结果。", "Demonstrates product-scale extensibility and does not claim a cross-Env result reported by the paper.")
      },
      summary: t(
        "下一步不是复制一个成功案例，而是验证系统能否从案例中抽取可复用的数据构造 skill。",
        "The next step is not to copy one successful case, but to test whether the system can extract a reusable data-construction skill from it."
      )
    }
  ];
})();
