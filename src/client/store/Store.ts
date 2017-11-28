import {observable} from 'mobx';

export class Store {
	@observable activePane: string = "E";
	@observable message: string = "FOO";
}
