const AuthLoadingScreen = () => {
  return (
    <div className=" fixed top-0 left-0   w-full h-full flex items-center justify-center flex-col gap-2">
      <img
        onError={(e) => {
          // In Firefox, the alt text is displayed while loading the actual image, which may not look aesthetically pleasing. To address this, I initially set the text color to transparent. Once the image has loaded, I dynamically change the text color. This ensures that even if the image fails to load, the user will see the alt text.
          const element = e.target as HTMLImageElement;
          element.classList.add("!text-gray-700", "dark:!text-gray-200");
        }}
        onLoad={(e) => {
          const element = e.target as HTMLImageElement;
          element.classList.add("!text-gray-700", "dark:!text-gray-200");
        }}
        src="/illustrations/auth.svg"
        className="w-40 h-40 lg:w-48 lg:h-48 text-transparent"
        alt="Authenticating"
      />
      <div className=" flex items-center justify-center gap-2 ">
        <span className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-200 border-t-2 dark:border-t-cyan-500 border-t-cyan-500 animate-spin"></span>
        <p
          className={`  ${
            localStorage.getItem("theme") === "dark" ||
            localStorage.getItem("theme") === null
              ? "text-gray-200"
              : "text-gray-700"
          }`}
        >
          Authenticating...
        </p>
      </div>
    </div>
  );
};

export default AuthLoadingScreen;
