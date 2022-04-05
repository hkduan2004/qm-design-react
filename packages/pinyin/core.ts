/*
 * @Author: 焦质晔
 * @Date: 2021-12-21 14:36:30
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-25 10:57:05
 */
import DICT from './dict';
import type { Nullable } from '../_utils/types';

const FIRST_PINYIN_UNIHAN = '\u963F';
const LAST_PINYIN_UNIHAN = '\u9FFF';

const LATIN = 1;
const PINYIN = 2;
const UNKNOWN = 3;

let supported: Nullable<boolean> = null;
let COLLATOR;

function patchDict(patchers) {
  if (!patchers) return;
  if (typeof patchers === 'function') {
    patchers = [patchers];
  }
  if (patchers.forEach) {
    patchers.forEach((p) => {
      typeof p === 'function' && p(DICT);
    });
  }
}

function isSupported(force?: boolean) {
  if (!force && supported !== null) {
    return supported;
  }
  if (typeof Intl === 'object' && Intl.Collator) {
    COLLATOR = new Intl.Collator(['zh-Hans-CN', 'zh-CN']);
    supported = Intl.Collator.supportedLocalesOf(['zh-CN']).length === 1;
  } else {
    supported = false;
  }
  return supported;
}

function genToken(ch) {
  // Access DICT here, give the chance to patch DICT.
  const UNIHANS = DICT.UNIHANS;
  const PINYINS = DICT.PINYINS;
  const EXCEPTIONS = DICT.EXCEPTIONS;
  const token: any = {
    source: ch,
  };

  // First check EXCEPTIONS map, then search with UNIHANS table.
  if (ch in EXCEPTIONS) {
    token.type = PINYIN;
    token.target = EXCEPTIONS[ch];
    return token;
  }

  let offset = -1;
  let cmp;
  if (ch.charCodeAt(0) < 256) {
    token.type = LATIN;
    token.target = ch;
    return token;
  } else {
    cmp = COLLATOR.compare(ch, FIRST_PINYIN_UNIHAN);
    if (cmp < 0) {
      token.type = UNKNOWN;
      token.target = ch;
      return token;
    } else if (cmp === 0) {
      token.type = PINYIN;
      offset = 0;
    } else {
      cmp = COLLATOR.compare(ch, LAST_PINYIN_UNIHAN);
      if (cmp > 0) {
        token.type = UNKNOWN;
        token.target = ch;
        return token;
      } else if (cmp === 0) {
        token.type = PINYIN;
        offset = UNIHANS.length - 1;
      }
    }
  }

  token.type = PINYIN;
  if (offset < 0) {
    let begin = 0;
    let end = UNIHANS.length - 1;
    while (begin <= end) {
      offset = ~~((begin + end) / 2);
      const unihan = UNIHANS[offset];
      cmp = COLLATOR.compare(ch, unihan);

      // Catch it.
      if (cmp === 0) {
        break;
      } else if (cmp > 0) {
        // Search after offset.
        begin = offset + 1;
      } else {
        // Search before the offset.
        end = offset - 1;
      }
    }
  }

  if (cmp < 0) {
    offset--;
  }

  token.target = PINYINS[offset];
  if (!token.target) {
    token.type = UNKNOWN;
    token.target = token.source;
  }
  return token;
}

function parse(str) {
  if (typeof str !== 'string' || !isSupported()) {
    return str;
  }
  return str.split('').map((v) => genToken(v));
}

export default {
  isSupported,
  parse,
  patchDict,
  genToken, // inner usage
  convertToPinyin(str: string, lowerCase: boolean, separator: string) {
    return parse(str)
      .map((v) => {
        if (lowerCase && v.type === PINYIN) {
          return v.target.toLowerCase();
        }
        return v.target;
      })
      .join(separator || '');
  },
};
