import {injectable} from "inversify";

@injectable()
export class EggFinder {

  private regexp = 'egg';

  public isEgg(stringToSearch: string): boolean {
    return stringToSearch.search(this.regexp) >= 0;
  }
}