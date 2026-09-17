import moment from 'moment';

export class DateUtils {

  static getCurrentTimeStamp(pattern: string = 'DDMMYYYYHHmmss'): string {
    return moment().format(pattern);
  }
}