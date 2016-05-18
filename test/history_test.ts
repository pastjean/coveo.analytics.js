import test from 'ava';
import * as sinon from 'sinon';
import {NullStorage, WebStorage} from '../src/storage';
import * as history from '../src/history';

let storage: WebStorage;
let storageMock: Sinon.SinonMock;
let historyStore: history.HistoryStore;
let data: history.HistoryElement;

test.beforeEach(t => {
  storage = new NullStorage();
  storageMock = sinon.mock(storage);
  historyStore = new history.HistoryStore(storage);
  data = {
    name: 'name',
    value: 'value',
    time: 111111
  };
});

test.afterEach( t => {
  storage = null;
  storageMock = null;
  historyStore = null;
  data = null;
});

test('HistoryStore should be able to add an element in the history', t => {
  storageMock.expects('setItem').once().withArgs(history.STORE_KEY, sinon.match(JSON.stringify(data)));
  historyStore.addElement(data);
  storageMock.verify();
});

test('HistoryStore should be able to get the history', t => {
  storageMock.expects('getItem').once().withArgs(history.STORE_KEY);
  historyStore.getHistory();
  storageMock.verify();
});

test('HistoryStore should remove item when cleared', t => {
  storageMock.expects('removeItem').once().withArgs(history.STORE_KEY);
  historyStore.clear();
  storageMock.verify();
});

test('HistoryStore should be able to set the history', t => {
  var historyElements: history.HistoryElement[] = [data];
  storageMock.expects('setItem').once().withArgs(history.STORE_KEY, JSON.stringify(historyElements));
  historyStore.setHistory(historyElements);
  storageMock.verify();
});
