## Ant Design X Chat Spike

Decision: keep the AgentHub custom timeline for this change and migrate only lower-level controls now.

Findings:
- `@ant-design/x@2.7.0` provides Bubble, BubbleList, Sender, Conversations, Suggestion, Welcome, and related AI UI primitives.
- Bubble/Sender are useful references for future chat polish, especially message bubble states and sender affordances.
- The current AgentHub timeline is not a plain chat transcript. It mixes agent/user messages, run events, permission cards, diff cards, artifacts, summaries, Context Inspector selection, and click-through agent navigation.
- Replacing the timeline with BubbleList in this pass would require either embedding operational cards inside chat bubbles or splitting timeline rendering paths, both of which would increase risk and weaken the current compact operational flow.
- Sender may be useful later, but the current composer has AgentHub-specific mention and slash-command targeting semantics that are already tied to run creation state.

Implementation stance:
- Keep `ChatTimeline` custom for mixed operational content.
- Keep the composer shell custom but migrate its input, suggestion buttons, and send button to AgentHub Ant Design-backed wrappers.
- Keep `@ant-design/x` installed for continued evaluation, but do not route production timeline rendering through it yet.

## Build Impact

- Web production build after Ant Design and Ant Design X install: `dist/assets/index-D1OAz_Cp.js` is 876.93 kB, gzip 273.77 kB.
- Vite reports the existing chunk-size warning for chunks above 500 kB.
- Follow-up recommendation: split Ant Design-heavy management pages or vendor chunks once the migration stabilizes.
