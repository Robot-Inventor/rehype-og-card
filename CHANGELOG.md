# rehype-og-card

## 3.1.0

### Minor Changes

- [#382](https://github.com/Robot-Inventor/rehype-og-card/pull/382) [`2edb906`](https://github.com/Robot-Inventor/rehype-og-card/commit/2edb9062cd9ef76f4f899b58b0e44ea90e0017c0) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - feat: add checks to ensure thumbnails and favicons are image files

## 3.0.1

### Patch Changes

- [#374](https://github.com/Robot-Inventor/rehype-og-card/pull/374) [`71f1c05`](https://github.com/Robot-Inventor/rehype-og-card/commit/71f1c05a4a9108057c3e2c650bc9549fefab6d73) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore(deps): bump undici from 7.16.0 to 7.18.2

## 3.0.0

### Major Changes

- [#368](https://github.com/Robot-Inventor/rehype-og-card/pull/368) [`b325384`](https://github.com/Robot-Inventor/rehype-og-card/commit/b325384c6e2ed3ce744c1f1a96c6edd8f8fe001d) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - fix: remove parent `p` tag from link cards to prevent invalid HTML

    You can disable this behavior by setting the `removeParentPTag` option to `false`.

## 2.0.2

### Patch Changes

- [#364](https://github.com/Robot-Inventor/rehype-og-card/pull/364) [`cbcb63c`](https://github.com/Robot-Inventor/rehype-og-card/commit/cbcb63c7641498daaf2b55d765ddd3c562f927b2) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - fix: resolve occasional missing favicon src in link cards

- [#363](https://github.com/Robot-Inventor/rehype-og-card/pull/363) [`915bf2c`](https://github.com/Robot-Inventor/rehype-og-card/commit/915bf2c533633c64a3af204f5ca53e971d14283a) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - fix: update crawler UA to fix Amazon fetching

## 2.0.1

### Patch Changes

- [#361](https://github.com/Robot-Inventor/rehype-og-card/pull/361) [`8b154c5`](https://github.com/Robot-Inventor/rehype-og-card/commit/8b154c5b0e9017b0232df41ea4b8fb418a363984) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - fix: publish `dist` directory to npm correctly

## 2.0.0

### Major Changes

- [#357](https://github.com/Robot-Inventor/rehype-og-card/pull/357) [`193b2fe`](https://github.com/Robot-Inventor/rehype-og-card/commit/193b2fe18df836fc9d603c58edf71b8e88ebf695) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - feat: add cache expiration options for build and server cache

    Note: When `buildCacheMaxAge` is set to a number (default 30 days), legacy build cache entries created by older versions without `cachedAt` (and image entries missing `cache.json`) may be deleted on first run.

## 1.1.1

### Patch Changes

- [#346](https://github.com/Robot-Inventor/rehype-og-card/pull/346) [`37efcab`](https://github.com/Robot-Inventor/rehype-og-card/commit/37efcab5567568298ab4b33e8ffc9eb6792a32e8) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore(deps): bump mdast-util-to-hast from 13.2.0 to 13.2.1

- [#342](https://github.com/Robot-Inventor/rehype-og-card/pull/342) [`6d6a0c3`](https://github.com/Robot-Inventor/rehype-og-card/commit/6d6a0c3cae194b34483def406024be466adc964b) Thanks [@renovate](https://github.com/apps/renovate)! - chore(deps): update dependency open-graph-scraper to v6.11.0

## 1.1.0

### Minor Changes

- [#330](https://github.com/Robot-Inventor/rehype-og-card/pull/330) [`784ba14`](https://github.com/Robot-Inventor/rehype-og-card/commit/784ba1492cc8dce3536eeaadd92c330ecc91b31e) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - feat: add support for root relative paths for thumbnails

## 1.0.27

### Patch Changes

- [#318](https://github.com/Robot-Inventor/rehype-og-card/pull/318) [`f3fc3d0`](https://github.com/Robot-Inventor/rehype-og-card/commit/f3fc3d0a88858acbc8bab0bd99afd00a57a5e497) Thanks [@renovate](https://github.com/apps/renovate)! - chore(deps): update dependency unist-util-visit-parents to v6.0.2

## 1.0.26

### Patch Changes

- [#311](https://github.com/Robot-Inventor/rehype-og-card/pull/311) [`c5443f6`](https://github.com/Robot-Inventor/rehype-og-card/commit/c5443f651527293ab1e33bc9684a710f629fcbd8) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore(deps-dev): bump vite from 6.3.4 to 7.1.5

## 1.0.25

### Patch Changes

- [#300](https://github.com/Robot-Inventor/rehype-og-card/pull/300) [`48cd210`](https://github.com/Robot-Inventor/rehype-og-card/commit/48cd210aa35f92deb20f860a869c2e15cc59c9f1) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - ci: migrate from npm token to trusted publishing

## 1.0.24

### Patch Changes

- [#279](https://github.com/Robot-Inventor/rehype-og-card/pull/279) [`c4c5fd6`](https://github.com/Robot-Inventor/rehype-og-card/commit/c4c5fd6349dd178c738c6ddcb96012ca5ba374b6) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - fix: ensure link text matches href after trimming whitespace

## 1.0.23

### Patch Changes

- [#271](https://github.com/Robot-Inventor/rehype-og-card/pull/271) [`bfe341f`](https://github.com/Robot-Inventor/rehype-og-card/commit/bfe341fe26470a5cc0644aa57defe6e87ec0e6c8) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency open-graph-scraper to v6.10.0

## 1.0.22

### Patch Changes

- [#264](https://github.com/Robot-Inventor/rehype-og-card/pull/264) [`3c1b72c`](https://github.com/Robot-Inventor/rehype-og-card/commit/3c1b72c069f1ef83d618cbad2fee91fc66c37178) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - chore: update vulnerable dependencies

## 1.0.21

### Patch Changes

- [#259](https://github.com/Robot-Inventor/rehype-og-card/pull/259) [`b5d4a67`](https://github.com/Robot-Inventor/rehype-og-card/commit/b5d4a671ae45298f3943b8b5afabfd009e4ed63f) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore(deps-dev): bump vite from 6.2.5 to 6.2.6

## 1.0.20

### Patch Changes

- [#253](https://github.com/Robot-Inventor/rehype-og-card/pull/253) [`0cc005a`](https://github.com/Robot-Inventor/rehype-og-card/commit/0cc005a219feb88baf50b10105679c90cfd3b57c) Thanks [@renovate](https://github.com/apps/renovate)! - chore(deps): update dependency remark-rehype to v11.1.2

## 1.0.19

### Patch Changes

- [#222](https://github.com/Robot-Inventor/rehype-og-card/pull/222) [`14fea5a`](https://github.com/Robot-Inventor/rehype-og-card/commit/14fea5ab08831786efdc7a4db8f80cf58f96f85d) Thanks [@renovate](https://github.com/apps/renovate)! - chore(deps): update dependency hast-util-to-html to v9.0.5

- [#223](https://github.com/Robot-Inventor/rehype-og-card/pull/223) [`e7ab861`](https://github.com/Robot-Inventor/rehype-og-card/commit/e7ab861ceb6bc16cf656b9fef7e6240e6569c4a2) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency hastscript to v9.0.1

## 1.0.18

### Patch Changes

- [#219](https://github.com/Robot-Inventor/rehype-og-card/pull/219) [`78ab7be`](https://github.com/Robot-Inventor/rehype-og-card/commit/78ab7be44a7c4f4cd9a62c7d4be4feb4123ba7d5) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - refactor: reduce dependency

## 1.0.17

### Patch Changes

- [#197](https://github.com/Robot-Inventor/rehype-og-card/pull/197) [`fdd1bc0`](https://github.com/Robot-Inventor/rehype-og-card/commit/fdd1bc0775eac9ec304db870004a680f897d3ba7) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore(deps): bump undici from 6.21.0 to 6.21.1

## 1.0.16

### Patch Changes

- [#193](https://github.com/Robot-Inventor/rehype-og-card/pull/193) [`8472851`](https://github.com/Robot-Inventor/rehype-og-card/commit/847285111a75a9110fcde9da78bccc160b9d11ca) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency open-graph-scraper to v6.9.0

## 1.0.15

### Patch Changes

- [#187](https://github.com/Robot-Inventor/rehype-og-card/pull/187) [`9986196`](https://github.com/Robot-Inventor/rehype-og-card/commit/9986196cbbbff8d831677352de8c0cb05a9e93a6) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency open-graph-scraper to v6.8.4

## 1.0.14

### Patch Changes

- [#174](https://github.com/Robot-Inventor/rehype-og-card/pull/174) [`997d14b`](https://github.com/Robot-Inventor/rehype-og-card/commit/997d14bfae8eb097ec91a306ed9cf7e5cd4c6f03) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency @robot-inventor/ts-utils to v0.6.2

## 1.0.13

### Patch Changes

- [#168](https://github.com/Robot-Inventor/rehype-og-card/pull/168) [`ad94686`](https://github.com/Robot-Inventor/rehype-og-card/commit/ad94686dccd499f112c8b25923c03df79f49dff5) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - fix: handle incorrect file extension recognition for image downloads causing long filenames and errors

- [#169](https://github.com/Robot-Inventor/rehype-og-card/pull/169) [`bfc40de`](https://github.com/Robot-Inventor/rehype-og-card/commit/bfc40dea9a7d996b735fb4eae086973587882c3b) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - chore: update vulnerable dependencies

- [#167](https://github.com/Robot-Inventor/rehype-og-card/pull/167) [`284336c`](https://github.com/Robot-Inventor/rehype-og-card/commit/284336c20e6908cd71a08e1994f71e6974658572) Thanks [@renovate](https://github.com/apps/renovate)! - chore(deps): update dependency hast-util-to-html to v9.0.4

## 1.0.12

### Patch Changes

- [#162](https://github.com/Robot-Inventor/rehype-og-card/pull/162) [`b2493aa`](https://github.com/Robot-Inventor/rehype-og-card/commit/b2493aa1cd2d52dfcfca5c192625fe48114d861b) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency open-graph-scraper to v6.8.3

## 1.0.11

### Patch Changes

- [#146](https://github.com/Robot-Inventor/rehype-og-card/pull/146) [`a9b6394`](https://github.com/Robot-Inventor/rehype-og-card/commit/a9b63941753590e526df7a17ca72e945df81d613) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - chore: improve type safety

## 1.0.10

### Patch Changes

- [#141](https://github.com/Robot-Inventor/rehype-og-card/pull/141) [`aa1c53a`](https://github.com/Robot-Inventor/rehype-og-card/commit/aa1c53aca65500c7b67d4ee0a71aa3085f4c32b2) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - fix: update vulnerable dependencies

- [#143](https://github.com/Robot-Inventor/rehype-og-card/pull/143) [`05a1d29`](https://github.com/Robot-Inventor/rehype-og-card/commit/05a1d299437713e99bfe227b0298615dad015bbd) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - chore: use `@robot-inventor/ts-utils`

## 1.0.9

### Patch Changes

- [#108](https://github.com/Robot-Inventor/rehype-og-card/pull/108) [`b32c987`](https://github.com/Robot-Inventor/rehype-og-card/commit/b32c98788d7d42b2c4a40e80ebcaf970f6f4b24b) Thanks [@renovate](https://github.com/apps/renovate)! - chore(deps): update dependency rehype-stringify to v10.0.1

## 1.0.8

### Patch Changes

- [#103](https://github.com/Robot-Inventor/rehype-og-card/pull/103) [`fb0efc7`](https://github.com/Robot-Inventor/rehype-og-card/commit/fb0efc761ac530846c1e3d2dbc52cf20eb5a3b85) Thanks [@renovate](https://github.com/apps/renovate)! - chore(deps): update dependency remark-rehype to v11.1.1

- [#102](https://github.com/Robot-Inventor/rehype-og-card/pull/102) [`fd10e45`](https://github.com/Robot-Inventor/rehype-og-card/commit/fd10e45501492f1d5e7b0482444a7835d1ef862d) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency open-graph-scraper to v6.8.2

## 1.0.7

### Patch Changes

- [#98](https://github.com/Robot-Inventor/rehype-og-card/pull/98) [`ca1ae6d`](https://github.com/Robot-Inventor/rehype-og-card/commit/ca1ae6dc071507d7aa68abe1864197f6963ebfca) Thanks [@renovate](https://github.com/apps/renovate)! - chore(deps): update dependency hast-util-to-html to v9.0.3

## 1.0.6

### Patch Changes

- [#85](https://github.com/Robot-Inventor/rehype-og-card/pull/85) [`0cfacb8`](https://github.com/Robot-Inventor/rehype-og-card/commit/0cfacb8a9d86ab3293df787a59eb4ba3caf853bb) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency open-graph-scraper to v6.8.1

## 1.0.5

### Patch Changes

- [#82](https://github.com/Robot-Inventor/rehype-og-card/pull/82) [`75a2744`](https://github.com/Robot-Inventor/rehype-og-card/commit/75a2744e25cc8995a0b2de78adc27f74978a4e13) Thanks [@renovate](https://github.com/apps/renovate)! - chore(deps): update dependency hast-util-to-html to v9.0.2

## 1.0.4

### Patch Changes

- [#72](https://github.com/Robot-Inventor/rehype-og-card/pull/72) [`f50de26`](https://github.com/Robot-Inventor/rehype-og-card/commit/f50de265e55699165a96dc506cd9c5ecbc0fa82e) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency open-graph-scraper to v6.8.0

## 1.0.3

### Patch Changes

- [#67](https://github.com/Robot-Inventor/rehype-og-card/pull/67) [`0ec3969`](https://github.com/Robot-Inventor/rehype-og-card/commit/0ec3969b230d6655a7aae3afa55ba346ab33e8ec) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - fix: fix some ESLint errors

## 1.0.2

### Patch Changes

- [#57](https://github.com/Robot-Inventor/rehype-og-card/pull/57) [`1896c98`](https://github.com/Robot-Inventor/rehype-og-card/commit/1896c98277c62445391bf445e74c55f80467b8af) Thanks [@renovate](https://github.com/apps/renovate)! - chore(deps): update dependency @robot-inventor/eslint-config to v2

## 1.0.1

### Patch Changes

- [#52](https://github.com/Robot-Inventor/rehype-og-card/pull/52) [`e9db07a`](https://github.com/Robot-Inventor/rehype-og-card/commit/e9db07a7162410c54f30acfe22d70c232911da58) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency open-graph-scraper to v6.7.2

## 1.0.0

### Major Changes

- [#49](https://github.com/Robot-Inventor/rehype-og-card/pull/49) [`0f9ccbe`](https://github.com/Robot-Inventor/rehype-og-card/commit/0f9ccbe13ddca30ab05887a93af759e66a7ff0a0) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - feat: add `openInNewTab` option

## 0.4.3

### Patch Changes

- [#46](https://github.com/Robot-Inventor/rehype-og-card/pull/46) [`ff9d9a6`](https://github.com/Robot-Inventor/rehype-og-card/commit/ff9d9a6c6b4e517dd4e95bc35f1740c43d301031) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency open-graph-scraper to v6.7.1

## 0.4.2

### Patch Changes

- [#39](https://github.com/Robot-Inventor/rehype-og-card/pull/39) [`fe5bab2`](https://github.com/Robot-Inventor/rehype-og-card/commit/fe5bab23c0f7087555d721b41da4a53f27163346) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency open-graph-scraper to v6.7.0

- [#41](https://github.com/Robot-Inventor/rehype-og-card/pull/41) [`ac48679`](https://github.com/Robot-Inventor/rehype-og-card/commit/ac486796c2ba97abd9b374e36b47a519d388473e) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - fix: improve URL detection performance

## 0.4.1

### Patch Changes

- [#34](https://github.com/Robot-Inventor/rehype-og-card/pull/34) [`4263571`](https://github.com/Robot-Inventor/rehype-og-card/commit/4263571ce11b34895ae47e7850c0b44bf05ce980) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - fix: use node-fetch to prevent `Timeout.internalConnectMultipleTimeout` error

- [#36](https://github.com/Robot-Inventor/rehype-og-card/pull/36) [`065a362`](https://github.com/Robot-Inventor/rehype-og-card/commit/065a3620ec32e9485171f5a31e9fc0f4af84fe53) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - fix: delete unnecessary `await` to improve performance

## 0.4.0

### Minor Changes

- [#32](https://github.com/Robot-Inventor/rehype-og-card/pull/32) [`9c22ed0`](https://github.com/Robot-Inventor/rehype-og-card/commit/9c22ed0bfabacb5f3861f795bfd1986c4d2a70d8) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - feat: add build cache for OG metadata

### Patch Changes

- [#30](https://github.com/Robot-Inventor/rehype-og-card/pull/30) [`2fb9e8b`](https://github.com/Robot-Inventor/rehype-og-card/commit/2fb9e8b6f20015b25a92605227e5943f932b06f6) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - fix: improve build cache process

## 0.3.3

### Patch Changes

- [#28](https://github.com/Robot-Inventor/rehype-og-card/pull/28) [`83096ab`](https://github.com/Robot-Inventor/rehype-og-card/commit/83096ab5b566eb5695c539aef4cc2bf07245d89a) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - refactor: improve directory copy operation

## 0.3.2

### Patch Changes

- [#27](https://github.com/Robot-Inventor/rehype-og-card/pull/27) [`0fe1c4c`](https://github.com/Robot-Inventor/rehype-og-card/commit/0fe1c4ce3c7020bdb40e06b52df546bbe857c07e) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - test: add tests for network utility

- [#25](https://github.com/Robot-Inventor/rehype-og-card/pull/25) [`6a34d92`](https://github.com/Robot-Inventor/rehype-og-card/commit/6a34d920811acef7bdea82a140ae509bd7f4b78b) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - refactor: refactor utilities

## 0.3.1

### Patch Changes

- [#20](https://github.com/Robot-Inventor/rehype-og-card/pull/20) [`f4dae7b`](https://github.com/Robot-Inventor/rehype-og-card/commit/f4dae7b7f2b7690cd044bafa4b89299d52661340) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - docs: improve JSDoc comments of `RehypeOGCardOptions`

- [#22](https://github.com/Robot-Inventor/rehype-og-card/pull/22) [`dd82cb8`](https://github.com/Robot-Inventor/rehype-og-card/commit/dd82cb88240269594b5682a5cc2606a22312ae89) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - fix: improve build cache implementation

## 0.3.0

### Minor Changes

- [#19](https://github.com/Robot-Inventor/rehype-og-card/pull/19) [`90366c6`](https://github.com/Robot-Inventor/rehype-og-card/commit/90366c6aab7923bed9e74b14b63a400b388b24df) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - feat: add the build cache feature

### Patch Changes

- [#15](https://github.com/Robot-Inventor/rehype-og-card/pull/15) [`926b1f9`](https://github.com/Robot-Inventor/rehype-og-card/commit/926b1f9452958876045fffaed8f1039f291655d9) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - docs: improve description for the `serverCachePath` option

- [#17](https://github.com/Robot-Inventor/rehype-og-card/pull/17) [`30324d4`](https://github.com/Robot-Inventor/rehype-og-card/commit/30324d456640ac90d48e5bcf632e57aa62ab8ce7) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - fix: change to not download images if they have already exists

## 0.2.1

### Patch Changes

- [#13](https://github.com/Robot-Inventor/rehype-og-card/pull/13) [`fd6f7e8`](https://github.com/Robot-Inventor/rehype-og-card/commit/fd6f7e88a2c5abfb17475d95bae282cf8da0e677) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - fix: prevent converting URLs with non-HTTP(S) protocols

## 0.2.0

### Minor Changes

- [#11](https://github.com/Robot-Inventor/rehype-og-card/pull/11) [`3b3a2bd`](https://github.com/Robot-Inventor/rehype-og-card/commit/3b3a2bd9ab36a0135db665c0404ed1b858f07a04) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - fix: wrap with `div` elements

## 0.1.1

### Patch Changes

- [#9](https://github.com/Robot-Inventor/rehype-og-card/pull/9) [`27e9ae0`](https://github.com/Robot-Inventor/rehype-og-card/commit/27e9ae0ed98ecd720f9c8ff9bc3d1c8a2db04442) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - test: add a test for general use cases

- [#10](https://github.com/Robot-Inventor/rehype-og-card/pull/10) [`c0018b0`](https://github.com/Robot-Inventor/rehype-og-card/commit/c0018b000bb279e542293986e4ededf3f0d234a0) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - refactor: use `hastscript` to create hast

- [#7](https://github.com/Robot-Inventor/rehype-og-card/pull/7) [`70545a9`](https://github.com/Robot-Inventor/rehype-og-card/commit/70545a9ed3649abe45da7dca3866d5a794e9d768) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - fix: fix invalid server chache path

## 0.1.0

### Minor Changes

- [#2](https://github.com/Robot-Inventor/rehype-og-card/pull/2) [`1c4b8a1`](https://github.com/Robot-Inventor/rehype-og-card/commit/1c4b8a1653659d14989ed4227c3a4ac235311cbf) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - feat: initial implementation

### Patch Changes

- [#6](https://github.com/Robot-Inventor/rehype-og-card/pull/6) [`f2a6ca7`](https://github.com/Robot-Inventor/rehype-og-card/commit/f2a6ca7caa752738c1188ee1ad85a33b0212054a) Thanks [@Robot-Inventor](https://github.com/Robot-Inventor)! - docs: update README and improve JSDoc
