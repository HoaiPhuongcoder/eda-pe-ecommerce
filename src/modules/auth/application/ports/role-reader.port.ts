export const ROLE_READER_PORT = Symbol('ROLE_READER_PORT');
export interface RoleReaderPort {
  getClientRoleId(): Promise<number>;
}
