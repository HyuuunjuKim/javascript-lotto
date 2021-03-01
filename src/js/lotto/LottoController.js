import { onModalShow } from "../utils.js";
import { $modal } from "../elements.js";
import {
  INVALID_PRICE_ERROR,
  INVALID_WINNGNUMBER_ERROR,
  DUPLICATED_WINNINGNUMBER_ERROR,
} from "../constants.js";
import {
  isValidPrice,
  isNumbersInRange,
  isDistinctNumbers,
} from "../validates.js";
export default class LottoController {
  constructor(lottoModel, lottoView) {
    this.lottoModel = lottoModel;
    this.lottoView = lottoView;
  }

  isNumbersInRange(numbers, min, max) {
    return numbers.every((num) => min <= num && max >= num);
  }

  isDistinctNumbers(numbers) {
    const numbersSet = new Set(numbers);

    return numbersSet.size === numbers.length;
  }

  countMatchedNumbers(lottoNumber, resultNumber) {
    const matchedNumbers = lottoNumber.filter(
      (num) => resultNumber.indexOf(num) !== -1
    );

    return matchedNumbers.length;
  }

  checkRanking(lottoNumber, winningNumber, bonusNumber) {
    const numOfMatched = this.countMatchedNumbers(lottoNumber, winningNumber);
    switch (numOfMatched) {
      case 3:
        return "ranking5";
      case 4:
        return "ranking4";
      case 5:
        if (this.countMatchedNumbers(lottoNumber, [bonusNumber]) === 1) {
          return "ranking2";
        }
        return "ranking3";
      case 6:
        return "ranking1";
      default:
        return "noPrize";
    }
  }

  setPrizeTable(winningNumber, bonusNumber) {
    this.lottoModel.lottoList.forEach((lotto) => {
      const ranking = this.checkRanking(
        lotto.number,
        winningNumber,
        bonusNumber
      );
      this.prizeTable[ranking].num++;
    });
  }

  calculateEarningRate() {
    const totalPrize = Object.values(this.prizeTable).reduce(
      (totalPrize, ranking) => {
        return (totalPrize += ranking.num * ranking.prize);
      },
      0
    );

    return Math.round((totalPrize / this.lottoModel.price) * 100);
  }

  onSubmitPrice(price) {
    this.lottoView.resetLottoView(); // 구입 금액 재입력 했을 경우
    this.lottoModel.resetLottoList();

    if (!isValidPrice(price)) {
      alert(INVALID_PRICE_ERROR);
      this.lottoView.resetLottoView();

      return;
    }
    this.lottoModel.setPrice(price);
    this.lottoView.showPurchase(
      this.lottoModel.lottoList,
      this.lottoModel.price
    );
  }

  onToggleLottoNumbers(e) {
    e.target.checked
      ? this.lottoView.showTicketDetails(this.lottoModel.lottoList)
      : this.lottoView.showTickets(this.lottoModel.lottoList.length);
  }

  onSubmitResultNumber(winningNumber, bonusNumber) {
    const numbers = [...winningNumber, bonusNumber];
    if (!isNumbersInRange(numbers, 1, 45)) {
      alert(INVALID_WINNGNUMBER_ERROR);

      return;
    }
    if (!isDistinctNumbers(numbers)) {
      alert(DUPLICATED_WINNINGNUMBER_ERROR);

      return;
    }

    onModalShow($modal);
  }
}
