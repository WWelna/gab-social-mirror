import isObject from 'lodash/isObject'
import {
  Map as ImmutableMap,
  List as ImmutableList,
} from 'immutable'

export default function normalizeReactionsCounts(obj) {
  if (!isObject(obj)) return null
  
  let list = ImmutableList()

  let arr = Object.entries(obj).sort((a, b)=>{
    if (b[1] > a[1]) return 1
    else if (b[1] < a[1]) return -1
    else {
      if (a[0] > b[0]) return 1
      else if (a[0] < b[0]) return -1
      else return 0
    }
  });
  
  arr.forEach((el) => {
    list = list.push(ImmutableMap({
      reactionId: el[0],
      count: el[1],
    }))
  })

  return list
}
