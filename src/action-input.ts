/** A held shield remains requested until every physical input source is released. */
export class BlockInput {
    private readonly sources = new Set<string>();
    press(source: string) { this.sources.add(source); }
    release(source: string) { this.sources.delete(source); }
    clear() { this.sources.clear(); }
    get held() { return this.sources.size > 0; }
}
