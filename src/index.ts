import { Version } from 'bcdice';
import './bcdi18n'
import 'bcdice/lib/bcdice/game_system';
// import 'bcdice/lib/bcdice/game_system/SwordWorld2_0';
// import 'bcdice/lib/bcdice/game_system/SwordWorld2_5';
import StaticLoader from './bcd-loader'
import { bracketParse } from './bracket-parser';

console.log('BCDice Version:', Version);


let ext = seal.ext.find('bcdice');
if (!ext) {
  ext = seal.ext.new('bcdice', '木落', '1.1.0');
  seal.ext.register(ext);
}

const cmdBCD = seal.ext.newCmdItemInfo();
cmdBCD.name = 'bcd';
cmdBCD.help = 'bcdice 骰点，指令格式:\n.bcd version // 查看版本\n.bcd load <系统名> // 加载一个系统\n.bcd 1d4 // 进行操作\n.bcd find <规则名> // 查找系统，输入游戏名的一部分，仅英文区分大小写';

let curSys = undefined;

cmdBCD.solve = (ctx, msg, cmdArgs) => {
  let val = cmdArgs.getArgN(1);
  switch (val) {
    case 'help':
    case '': {
      // .bcd help
      const ret = seal.ext.newCmdExecuteResult(true);
      ret.showHelp = true;
      return ret;
    }

    case 'ver':
    case 'version': {
      seal.replyToSender(ctx, msg, `BCDice Version ${Version}`);
      break;
    }

    case 'load': {
      const sysName = cmdArgs.getArgN(2)
      loader.dynamicLoad(sysName).then((GameSystem) => {
        curSys = GameSystem;
        seal.replyToSender(ctx, msg, `系统${GameSystem.NAME}已加载`);
        // GameSystem.NAME
        // const result = GameSystem.eval('CC<=54');
        // console.log(result && result.text);  
      }).catch(e => {
        seal.replyToSender(ctx, msg, `系统${sysName}加载失败: ` + e.toString());
      })
      break;
    }

    case 'find': {
      const name = cmdArgs.getArgN(2);
      const lst = [];
      for (let i of systemList) {
        if (i.includes(name)) {
          lst.push(`- ${i}`);
        }
      }
      seal.replyToSender(ctx, msg, `找到一些结果:\n${lst.slice(0, 10).join('\n')}`);
      break;
    }

    default: {
      if (curSys) {
        let lastText = '';
        val = cmdArgs.cleanArgs;
        if (val) {
          try {
            const pairs = bracketParse(val);
            let leftIndex = val.length;
            for (let i = pairs.length - 1; i >= 0; i--) {
              const p = pairs[i];
              const fstr = seal.format(ctx, val.slice(p[0], p[1]+1));
              lastText = fstr + val.slice(p[1]+1, leftIndex) + lastText;
              leftIndex = p[0];
            }
            lastText = val.slice(0, leftIndex) + lastText;
            console.log('>DiceText: ' + lastText);
          } catch (e) {
            seal.replyToSender(ctx, msg, '执行失败，可能是对 {} 的使用不规范: ' + e.toString());
            return seal.ext.newCmdExecuteResult(true);
          }
        }
        const ret = curSys.eval(lastText || '');
        if (ret) {
          seal.replyToSender(ctx, msg, ret.text);
        } else {
          seal.replyToSender(ctx, msg, '执行失败，未得到任何返回');
        }
      } else {;
        seal.replyToSender(ctx, msg, '还未加载系统，请先执行 .bcd load SwordWorld2.5 // 加载剑世界2.5，或其他200余个规则系统(可用.bcd find搜索)')
      }
    }
  }
  return seal.ext.newCmdExecuteResult(true);
}

const loader = new StaticLoader();
const systemList = loader.listAvailableGameSystems().map(info => info.id);
// loader.dynamicLoad('Cthulhu7th')

ext.cmdMap['bcd'] = cmdBCD;
