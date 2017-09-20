<p align="center">
<img src="img/akashic-sandbox.png"/>
</p>

# Akashic Sandbox

Akashic Sandboxは、Akashic Engineを使って作成されたゲームの動作確認ツールです。

## インストール

Node.js が必要です。次のコマンドでインストールできます。

```
npm install -g @akashic/akashic-sandbox
```

## 利用方法

```
akashic-sandbox [-p <port>] [--cascade<cascade-path>] [<path>]
```

で、 `<path>` に置かれているAkashicのゲームを起動できます。
出力される案内にしたがって、Webブラウザで `http://localhost:3000/game/` を開いてください。

`<path>` には `game.json` が存在する必要があります。省略された場合、 `<path>` はカレントディレクトリ (`.`) です。
`-p` オプションを指定すると、サーバのポート番号を変更できます。たとえば `-p 3100` とした場合、 Webブラウザで開くURLは `http://localhost:3100/game/` になります。

`--cascade <cascade-path>` を与えると、 `path` にある game.json に対して `<cascade-path>` にある game.json がカスケードされます。
`--cascade` を複数指定した場合、指定した順でカスケードされます。

## Akashic Engine 2.0 を利用したコンテンツの起動方法

`game.json` に以下の記述を追加すると、対象のゲームを Akashic Engine 2.0 として実行します。

```js
{
..
	"environment": {
		"engine": "v2"
	}
}
```

## 表示オプション

* http://localhost:3000/game/?profiler=1 にアクセスすると、プロファイラー表示モードでゲームを実行することができます
* http://localhost:3000/game/?fit=1 にアクセスすると、画面を最大まで拡大した状態でゲームを実行することができます
* http://localhost:3000/game/?bg=1 にアクセスすると、バックグラウンドとゲームに色をつけた状態でゲームを実行することができます

## デベロッパーメニュー

* ゲーム画面右上の歯車マークをクリックするとデベロッパーメニューが開きます。
* http://localhost:3000/game/?devmode=disable にアクセスするとデベロッパーメニューを無効化できます。

## Akashic Engine 2.0 より前の内部モジュールの更新

Akashic Engine 2.0 より前の内部モジュールを更新する場合、更新対象のモジュールを `js/v1` に手動でコピーする必要があります。
対象のモジュールは以下になります。

* @akashic/akashic-engine@<2.0.0
* @akashic/game-driver@<1.0.0
* @akashic/pdi-browser@<1.0.0

## ビルド方法

**akashic-sandbox** はTypeScriptで書かれたJSモジュールであるため、ビルドにはNode.jsが必要です。

`npm run build` にてビルドできます。

```sh
npm install
npm run build # src/以下をビルド
```

## テスト方法

1. [TSLint](https://github.com/palantir/tslint "TSLint")を使ったLint
2. [Jasmine](http://jasmine.github.io/ "Jasmine")を使ったユニットテスト

が実行されます。

```sh
npm test
```

## ライセンス

本リポジトリは MIT License の元で公開されています。
詳しくは [LICENSE](./LICENSE) をご覧ください。

ただし、画像ファイルおよび音声ファイルは
[CC BY 2.1 JP](https://creativecommons.org/licenses/by/2.1/jp/) の元で公開されています。
