# LuminaLUT Matcher

![LuminaLUT](https://raw.githubusercontent.com/nottmi/LUTMatcher/main/LuminaLUT.png)

LuminaLUT Matcher is a web-based tool for color grading enthusiasts and professional video editors. It allows you to take a reference image with a desired color aesthetic and apply it to your own footage, generating a `.cube` LUT file for use in any professional video editing software.

## Features

-   **Reference-Based Color Grading:** Match the color grading of any reference image.
-   **Real-time Preview:** See the color transformation applied to your source image instantly.
-   **Intensity Control:** Adjust the intensity of the color grade to blend it perfectly with your footage.
-   **AI-Powered Analysis:** Get an AI-powered analysis of your reference image's color profile.
-   **Export to .cube:** Export the generated color grade as a standard `.cube` LUT file, compatible with software like DaVinci Resolve, Adobe Premiere Pro, and Final Cut Pro.

## Technologies Used

-   **React:** A JavaScript library for building user interfaces.
-   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
-   **Vite:** A fast build tool and development server for modern web projects.
-   **Gemini API:** Used for the AI-powered color analysis.
-   **Lucide React:** A library of beautiful and consistent icons.

## Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/nottmi/LUTMatcher.git
    cd LUTMatcher
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add your Gemini API key:
    ```
    API_KEY=YOUR_GEMINI_API_KEY
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## How to Use

1.  **Upload Reference Image:** Upload the image with the color grade you want to replicate.
2.  **Upload Source Image:** Upload the image or footage you want to apply the color grade to.
3.  **Adjust Intensity:** Use the slider to adjust the intensity of the color grade.
4.  **Preview:** The preview will update in real-time to show you the final result.
5.  **Export LUT:** Click the "Export .cube" button to download the generated LUT file.