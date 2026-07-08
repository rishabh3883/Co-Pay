export default class AppModel {
  static getLocalData(key, fallback = null) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  }
  static saveLocalData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
}