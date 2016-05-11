export function flatten(list: any[]): any[] {
  return list.reduce((items: any[], next) => {
    if (Array.isArray(next)) {
      return items.concat(flatten(next));
    }

    return items.concat(next);
  }, []);
}