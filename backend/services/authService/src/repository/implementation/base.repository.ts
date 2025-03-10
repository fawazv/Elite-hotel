import { IBaseRepository } from "../interface/IBase.repository";
import { Model, Document } from "mongoose";

class BaseRepository<T extends Document> implements IBaseRepository<T> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }
  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }
  async findById(id: string): Promise<T | null> {
    return this.model.findById(id);
  }
  async update(id: string, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }
}

export default BaseRepository;
