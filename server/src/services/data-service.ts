interface DefaultDataServiceArgs {
  id: string;
  body: any;
}

interface DataService {
  create<T>(data: T): Promise<T>;
  update<T>(data: T): Promise<T>;
  delete<T>(id: number): Promise<T>;
  get<T>(id: number): Promise<T>;
  search<T>(query: string): Promise<any[]>;
}
