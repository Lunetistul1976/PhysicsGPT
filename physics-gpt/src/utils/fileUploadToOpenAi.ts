import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_CHAT_GPT_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * Uploads a file (from a local File object or a public URL) to OpenAI
 * and then adds it to a specified vector store.
 *
 * @param fileInput - A File object (e.g., from an <input type=\"file\"> element)
 *                    or a string representing a publicly accessible URL of the file.
 * @param targetVectorStoreId - The ID of the target vector store to add the file to.
 * @param vectorStoreNameIfCreate - The name of the vector store to create if it doesn't exist.
 * @returns The ID of the file object created within the vector store.
 * @throws Will throw an error if the file upload or adding to the vector store fails.
 */
export async function uploadFileAndAddToVectorStore(
  fileInput: File | string,
  vectorStoreNameIfCreate: string
): Promise<string> {
  let fileToUpload: File;
  let fileNameForUpload: string;

  if (typeof fileInput === "string") {
    // Handle URL input
    if (!fileInput.startsWith("http://") && !fileInput.startsWith("https://")) {
      throw new Error(
        "Invalid URL provided. Must start with http:// or https://"
      );
    }
    try {
      console.log(`Fetching file from URL: ${fileInput}`);
      const response = await fetch(fileInput);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch file from URL: ${response.status} ${response.statusText}`
        );
      }
      const blob = await response.blob();
      const urlParts = fileInput.split("/");
      fileNameForUpload =
        urlParts[urlParts.length - 1] || "downloaded_file_from_url";
      fileToUpload = new File([blob], fileNameForUpload, { type: blob.type });
      console.log(
        `Successfully fetched and created File object: ${fileNameForUpload}, size: ${fileToUpload.size} bytes`
      );
    } catch (error) {
      console.error("Error fetching or processing file from URL:", error);
      throw error;
    }
  } else {
    // Handle File object input
    fileToUpload = fileInput;
    fileNameForUpload = fileInput.name;
    console.log(
      `Using provided File object: ${fileNameForUpload}, size: ${fileToUpload.size} bytes`
    );
  }

  try {
    // Step 1: Upload the file to OpenAI.
    // The 'assistants' purpose is generally used for files that will be part of vector stores for Assistants.
    console.log(`Uploading file "${fileNameForUpload}" to OpenAI...`);
    const uploadedFile = await openai.files.create({
      file: fileToUpload,
      purpose: "assistants",
    });
    console.log(
      `File uploaded successfully to OpenAI. File ID: ${uploadedFile.id}`
    );

    // Step 2: Retrieve or create the vector store.
    let actualVectorStoreId: string | null;

    actualVectorStoreId = localStorage.getItem("vectorStoreId");

    if (!actualVectorStoreId) {
      const newStore = await openai.beta.vectorStores.create({
        name: vectorStoreNameIfCreate,
      });
      actualVectorStoreId = newStore.id;

      localStorage.setItem("vectorStoreId", newStore.id);
    } else {
      try {
        const existingStore = await openai.beta.vectorStores.retrieve(
          actualVectorStoreId
        );
        actualVectorStoreId = existingStore.id;
      } catch (error) {
        if (error instanceof OpenAI.APIError && error.status === 404) {
          console.log(
            `Vector store with ID ${actualVectorStoreId} not found. Creating a new one named "${vectorStoreNameIfCreate}"...`
          );
          const newStore = await openai.beta.vectorStores.create({
            name: vectorStoreNameIfCreate,
          });
          actualVectorStoreId = newStore.id;
          console.log(
            `Successfully created new vector store: ${actualVectorStoreId} (Name: "${vectorStoreNameIfCreate}")`
          );
        } else {
          console.error("Error retrieving or creating vector store:", error);
          throw error; // Re-throw other errors
        }
      }
    }

    // Step 3: Add the uploaded file to the determined vector store.
    console.log(
      `Adding file ${uploadedFile.id} to vector store ${actualVectorStoreId}...`
    );
    const vectorStoreFile = await openai.beta.vectorStores.files.create(
      actualVectorStoreId,
      {
        file_id: uploadedFile.id,
      }
    );
    console.log(
      `File successfully added to vector store. Vector Store File ID: ${vectorStoreFile.id}`
    );

    return vectorStoreFile.id;
  } catch (error) {
    console.error(
      "Error during OpenAI file operation (upload or add to vector store):",
      error
    );
    if (error instanceof OpenAI.APIError) {
      console.error(`OpenAI API Error Details:
        Status: ${error.status}
        Type: ${error.type}
        Code: ${error.code}
        Param: ${error.param}
        Message: ${error.message}`);
    }
    throw error;
  }
}
