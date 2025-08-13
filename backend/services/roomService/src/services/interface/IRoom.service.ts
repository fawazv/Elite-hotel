import { IRoom } from '../../interfaces/IRoom.interface'

export interface IRoomService {
  createRoom(payload: IRoom): Promise<any>
  getRoomById(id: string): Promise<any>
  getByNumericId(nid: number): Promise<any>
  updateRoom(id: string, payload: Partial<IRoom>): Promise<any>
  patchRoom(id: string, payload: Partial<IRoom>): Promise<any>
  deleteRoom(id: string): Promise<any>
  listRooms(filters: any): Promise<any>
}
