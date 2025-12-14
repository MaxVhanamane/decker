import { memo } from "react";

const DummyEditorContent = () => {
  const text = [
    "This is sample filler content meant to demonstrate how text appears within a blurred backdrop element.",
    "You can replace this text with anything you want, including paragraphs of instructions or UI descriptions.",
    "The blur effect is only noticeable when the background behind this layer is partially visible.",
    "Feel free to expand, shorten, or completely change these paragraphs depending on your layout needs.",
    "Using varied text helps visualize how real content might look when rendered inside this container.",
    "This dummy content is purely for testing and design previews, not for production use.",
  ];

  return (
    <div className="absolute inset-0 h-full py-4 -mx-2 blur-sm px-4 space-y-4">
      {text.map((t, i) => (
        <p key={i}>{t}</p>
      ))}
    </div>
  );
};

export default memo(DummyEditorContent);
