export interface FileSystemFile {
  id: string;
  name: string;
  content: string;
  type: "file" | "markdown";
  createdAt: number;
  modifiedAt: number;
}

export class FileSystem {
  private files: Map<string, FileSystemFile> = new Map();
  private fileCounter = 0;

  createFile(name: string, content: string = ""): FileSystemFile {
    const id = `file-${++this.fileCounter}`;
    const now = Date.now();
    const file: FileSystemFile = {
      id,
      name,
      content,
      type: name.endsWith(".md") ? "markdown" : "file",
      createdAt: now,
      modifiedAt: now,
    };
    this.files.set(id, file);
    return file;
  }

  getFile(id: string): FileSystemFile | undefined {
    return this.files.get(id);
  }

  updateFile(id: string, content: string): boolean {
    const file = this.files.get(id);
    if (file) {
      file.content = content;
      file.modifiedAt = Date.now();
      return true;
    }
    return false;
  }

  deleteFile(id: string): boolean {
    return this.files.delete(id);
  }

  getAllFiles(): FileSystemFile[] {
    return Array.from(this.files.values());
  }

  renameFile(id: string, newName: string): boolean {
    const file = this.files.get(id);
    if (file) {
      file.name = newName;
      file.type = newName.endsWith(".md") ? "markdown" : "file";
      file.modifiedAt = Date.now();
      return true;
    }
    return false;
  }
}


