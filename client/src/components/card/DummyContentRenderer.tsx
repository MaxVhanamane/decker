import { memo, useMemo } from "react";
import { motion } from "motion/react";

const jitter = (value: number, range = 4) =>
  Math.max(55, Math.min(100, value + (Math.random() * range * 2 - range)));

const paragraphTemplates = [
  [100, 96, 92],
  [100, 98, 95, 72],
  [100, 97, 93, 88, 70],
  [100, 98, 94, 90],
];

const codeTemplates = [
  [90, 85, 80],
  [92, 88, 86, 84],
  [88, 82, 78],
];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

type Block =
  | { type: "paragraph"; lines: number[] }
  | { type: "code"; lines: number[] };

const DummyContentRenderer = () => {
  const blocks = useMemo<Block[]>(() => {
    const paragraphCount = pick([4, 5, 6]);
    const codeBlockCount = pick([1, 2]);

    const paragraphs: Block[] = Array.from({ length: paragraphCount }).map(
      () => ({
        type: "paragraph",
        lines: pick(paragraphTemplates).map((w) => jitter(w)),
      })
    );

    const codes: Block[] = Array.from({ length: codeBlockCount }).map(() => ({
      type: "code",
      lines: pick(codeTemplates).map((w) => jitter(w, 3)),
    }));

    // Insert code blocks only between paragraphs
    const result: Block[] = [];
    paragraphs.forEach((p) => {
      result.push(p);
      if (codes.length && Math.random() > 0.6) {
        result.push(codes.pop()!);
      }
    });

    return result;
  }, []);

  return (
    <div className="text-left text-base pb-20 lg:pb-16 break-words font-light whitespace-pre-wrap text-gray-800 dark:text-gray-200">
      <div className="[&>*]:py-[3px] py-4 [&>*:nth-child(2)]:mt-1">
        <motion.div
          key="skeleton"
          className="w-full py-6"
          initial={{ opacity: 0.6, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {/* Title skeleton  */}
          <div className="shimmer-skeleton h-7 xl:w-[60%] w-[80%] rounded-md mb-4" />

          <div className="flex flex-col gap-4">
            {blocks.map((block, i) =>
              block.type === "paragraph" ? (
                <div key={i} className="flex flex-col gap-2">
                  {block.lines.map((width, j) => (
                    <div
                      key={j}
                      className="shimmer-skeleton h-4 rounded-md"
                      style={{ width: `${width}%` }}
                    />
                  ))}
                </div>
              ) : (
                <div
                  key={i}
                  className="rounded-md my-3 p-4 bg-gray-200/30 dark:bg-white/5 border border-gray-300/40 dark:border-white/10"
                >
                  <div className="flex flex-col gap-2">
                    {block.lines.map((width, j) => (
                      <div
                        key={j}
                        className="shimmer-skeleton h-3 rounded-md"
                        style={{ width: `${width}%` }}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default memo(DummyContentRenderer);
