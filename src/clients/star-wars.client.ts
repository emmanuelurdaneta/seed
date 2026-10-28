// Clase abstracta (no interfaz) para que Nest pueda usarla como token de inyección
export abstract class StarWarsClient {
  // Devuelve los nombres en el mismo orden que los ids.
  abstract getCharacterNames(ids: number[]): Promise<string[]>;

  // Devuelve los ids que no existen.
  abstract findMissingCharacterIds(ids: number[]): Promise<number[]>;
}
