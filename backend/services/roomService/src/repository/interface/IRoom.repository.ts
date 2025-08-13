import { IRoom } from '../../interfaces/Iroom.interface'

export interface IRoomRepository {
  create(room: Partial<IRoom>): Promise<any>
  findById(id: string): Promise<any>
  findByNumericId(nid: number): Promise<any>
  updateById(id: string, data: Partial<IRoom>): Promise<any>
  patchById(id: string, data: Partial<IRoom>): Promise<any>
  deleteById(id: string): Promise<any>
  list(filter: any): Promise<any>
}
