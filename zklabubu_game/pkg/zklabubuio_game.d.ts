/* tslint:disable */
/* eslint-disable */
export function log_to_proof_area(message: string): void;
export function show_proof_result(is_valid: boolean, proof_hash: string): void;
export enum GameState {
  NotStarted = 0,
  Playing = 1,
  Paused = 2,
  GameOver = 3,
}
export class GameManager {
  free(): void;
  constructor(canvas: HTMLCanvasElement, labubu_img: HTMLImageElement, labubu_shield_img: HTMLImageElement, labubu_double_img: HTMLImageElement, yellow_egg_img: HTMLImageElement, pink_egg_img: HTMLImageElement, purple_egg_img: HTMLImageElement, rock_img: HTMLImageElement, shield_img: HTMLImageElement, double_points_img: HTMLImageElement, extra_life_img: HTMLImageElement, slowdown_img: HTMLImageElement, egg_sound: HTMLAudioElement, rock_sound: HTMLAudioElement, shield_hit_sound: HTMLAudioElement);
  handle_key_press(event: KeyboardEvent): void;
  start(): void;
  stop(): void;
  restart(): void;
  update(delta_time: number): boolean;
  get_score(): number;
  get_lives(): number;
  is_game_over(): boolean;
  get_game_state(): GameState;
  set_sound_enabled(enabled: boolean): void;
  get_yellow_eggs_count(): number;
  get_blue_eggs_count(): number;
  get_purple_eggs_count(): number;
  get_game_time(): number;
  show_sp1_proof_interface(): void;
  hide_sp1_proof_interface(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_gamemanager_free: (a: number, b: number) => void;
  readonly gamemanager_new: (a: any, b: any, c: any, d: any, e: any, f: any, g: any, h: any, i: any, j: any, k: any, l: any, m: any, n: any, o: any) => number;
  readonly gamemanager_handle_key_press: (a: number, b: any) => void;
  readonly gamemanager_start: (a: number) => void;
  readonly gamemanager_stop: (a: number) => void;
  readonly gamemanager_restart: (a: number) => void;
  readonly gamemanager_update: (a: number, b: number) => number;
  readonly gamemanager_get_score: (a: number) => number;
  readonly gamemanager_get_lives: (a: number) => number;
  readonly gamemanager_is_game_over: (a: number) => number;
  readonly gamemanager_get_game_state: (a: number) => number;
  readonly gamemanager_set_sound_enabled: (a: number, b: number) => void;
  readonly gamemanager_get_yellow_eggs_count: (a: number) => number;
  readonly gamemanager_get_blue_eggs_count: (a: number) => number;
  readonly gamemanager_get_purple_eggs_count: (a: number) => number;
  readonly gamemanager_get_game_time: (a: number) => number;
  readonly gamemanager_show_sp1_proof_interface: (a: number) => [number, number];
  readonly gamemanager_hide_sp1_proof_interface: (a: number) => [number, number];
  readonly log_to_proof_area: (a: number, b: number) => void;
  readonly show_proof_result: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
