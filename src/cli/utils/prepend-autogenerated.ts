import * as fs from "fs-extra";
import * as path from "path";

export async function prependAutogenerated(folderPath: string) {
  try {
    const items = await fs.readdir(folderPath);

    for (const item of items) {
      const itemPath = path.join(folderPath, item);

      // Check if the item is a file or directory
      const stats = await fs.stat(itemPath);
      if (stats.isDirectory()) {
        // Recursively process subfolder
        await prependAutogenerated(itemPath);
      } else if (stats.isFile()) {
        // Process file
        const content = await fs.readFile(itemPath, "utf-8");
        const comment = `// autogenerated`;
        // stripe first line if it's a comment
        const firstLine = content.split("\n")[0];
        const isComment = firstLine.startsWith(comment);
        if (isComment) {
          console.log(`Skipping: ${itemPath}`);
          continue;
        }

        const updatedContent = `${comment}\n${content}`;
        await fs.writeFile(itemPath, updatedContent, "utf-8");
        console.log(`Updated: ${itemPath}`);
      }
    }
    console.log(
      `All files in ${folderPath} and its subfolders have been updated.`
    );
  } catch (error) {
    console.error(`Error updating files in ${folderPath}:`, error);
  }
}
