export const seedData3a = [
  {
    category: "ネットワークとセキュリティ",
    level: 1,
    question_no: 2,
    question_text: "SSL/TLSプロトコルの主な目的は何か。",
    choices: [
      "ネットワークの速度を向上させる",
      "インターネット通信の暗号化と認証を提供する",
      "ウイルスの検出と削除を行う",
      "ユーザーの位置情報を特定する"
    ],
    correct_index: 1,
    explanation: "SSL/TLSプロトコルは、インターネット上の通信を暗号化し、サーバーとクライアント間の認証を提供して、安全な通信を実現します。"
  },
  {
    category: "ネットワークとセキュリティ",
    level: 1,
    question_no: 3,
    question_text: "パスワードポリシーとして推奨されるのはどれか。",
    choices: [
      "1年に1回程度の変更でよい",
      "生年月日や連続した数字の使用は避ける",
      "わかりやすいパスワードを使う",
      "すべてのシステムで同じパスワードを使う"
    ],
    correct_index: 1,
    explanation: "強力なパスワードポリシーでは、予測しやすい情報の使用を避け、十分な複雑性と定期的な更新を求めることが推奨されます。"
  },
  {
    category: "ネットワークとセキュリティ",
    level: 1,
    question_no: 4,
    question_text: "VPN（仮想プライベートネットワーク）の主な利点は何か。",
    choices: [
      "インターネット接続を高速化する",
      "公開ネットワークを使用しながら安全な通信を実現する",
      "すべてのウイルスを防止する",
      "パスワードの必要性をなくす"
    ],
    correct_index: 1,
    explanation: "VPNは公開ネットワークを通じても、トンネリングと暗号化により、あたかもプライベートネットワークで通信しているかのような安全な環境を提供します。"
  },
  {
    category: "ネットワークとセキュリティ",
    level: 1,
    question_no: 5,
    question_text: "DMZ（非武装地帯）の目的として最も適切なものはどれか。",
    choices: [
      "インターネットのすべての危険性を完全に防ぐ",
      "Webサーバーなどの公開サーバーを内部ネットワークから分離する",
      "ユーザーのデータベースアクセスを加速させる",
      "ウイルスを検出するためのソフトウェア"
    ],
    correct_index: 1,
    explanation: "DMZは、インターネットに面したサーバーを内部ネットワークから分離して配置し、外部からの攻撃が内部ネットワークに直接到達するのを防ぎます。"
  },
  {
    category: "ネットワークとセキュリティ",
    level: 1,
    question_no: 6,
    question_text: "IPスプーフィング攻撃とは何か。",
    choices: [
      "パスワードを推測して不正にログインする",
      "送信元IPアドレスを偽造して通信を行う",
      "電話による詐欺行為",
      "キーボード操作の記録"
    ],
    correct_index: 1,
    explanation: "IPスプーフィングは、通信パケットの送信元IPアドレスを本物のアドレスに偽造して、信頼されたホストに見せかけて送信する攻撃です。"
  },
  {
    category: "ネットワークとセキュリティ",
    level: 1,
    question_no: 7,
    question_text: "デジタル署名の主な目的は何か。",
    choices: [
      "データの転送速度を向上させる",
      "メッセージの送信者の認証と改ざん防止を実現する",
      "インターネット接続を暗号化する",
      "ウイルスを検出する"
    ],
    correct_index: 1,
    explanation: "デジタル署名は、秘密鍵で作成され公開鍵で検証されることで、送信者の認証とメッセージの改ざんがないことを保証します。"
  },
  {
    category: "ネットワークとセキュリティ",
    level: 1,
    question_no: 8,
    question_text: "公開鍵基盤（PKI）における証明書の役割として最も適切なものはどれか。",
    choices: [
      "通信速度の最適化",
      "公開鍵の所有者の身元を証明する",
      "すべてのウイルスの防止",
      "ユーザーのパスワードを保管する"
    ],
    correct_index: 1,
    explanation: "PKIの証明書は、認証局（CA）によって発行され、公開鍵の所有者の身元を証明し、信頼を確立します。"
  },
  {
    category: "ネットワークとセキュリティ",
    level: 1,
    question_no: 9,
    question_text: "多要素認証（MFA）の例として適切でないものはどれか。",
    choices: [
      "パスワードと生体認証の組み合わせ",
      "パスワードとワンタイムパスワード",
      "複雑なパスワード1つだけ",
      "パスワードと物理的なセキュリティキー"
    ],
    correct_index: 2,
    explanation: "多要素認証は複数の異なる認証要素を組み合わせることで、セキュリティを強化します。パスワード1つだけは単要素認証であり多要素認証ではありません。"
  },
  {
    category: "ネットワークとセキュリティ",
    level: 1,
    question_no: 10,
    question_text: "HTTPSにおける鍵交換の目的は何か。",
    choices: [
      "Webサーバーの速度を向上させる",
      "クライアントとサーバー間の暗号化通信用の鍵を安全に共有する",
      "ユーザーの位置情報を取得する",
      "キャッシュを最適化する"
    ],
    correct_index: 1,
    explanation: "HTTPS通信では、TLSハンドシェイクで鍵交換が行われ、その後の通信データを暗号化するための共通鍵が安全に確立されます。"
  },
  {
    category: "ネットワークとセキュリティ",
    level: 2,
    question_no: 2,
    question_text: "DDoS攻撃の防御方法として適切でないものはどれか。",
    choices: [
      "トラフィック分析とレート制限の実装",
      "複数の地域にサーバーを分散配置する",
      "すべてのインターネット接続を遮断する",
      "ボットネット検出システムの導入"
    ],
    correct_index: 2,
    explanation: "すべてのインターネット接続を遮断すれば攻撃を受けませんが、サービスも利用できなくなるため、実務的な防御方法ではありません。"
  },
  {
    category: "ネットワークとセキュリティ",
    level: 2,
    question_no: 3,
    question_text: "PKIのハイブリッド暗号化方式について、最も正確な説明はどれか。",
    choices: [
      "公開鍵暗号と共通鍵暗号の両方を適切に組み合わせて使用する",
      "公開鍵暗号だけを使用する",
      "共通鍵暗号だけを使用する",
      "複数のパスワードを連結する"
    ],
    correct_index: 0,
    explanation: "ハイブリッド暗号化は、高速な共通鍵暗号でデータを暗号化し、公開鍵暗号で共通鍵を暗号化する方式で、両者の利点を活かします。"
  },
  {
    category: "ネットワークとセキュリティ",
    level: 2,
    question_no: 4,
    question_text: "DNS毒性化（DNS cache poisoning）攻撃の対策として最も効果的なものはどれか。",
    choices: [
      "DNSSEC（DNS Security Extensions）の導入",
      "すべてのDNS問い合わせを遮断する",
      "パスワードを強化する",
      "Webサーバーを複数用意する"
    ],
    correct_index: 0,
    explanation: "DNSSECは、DNSレコードのデジタル署名により、DNS毒性化攻撃から保護し、DNSレスポンスの真正性と完全性を検証します。"
  },
  {
    category: "ネットワークとセキュリティ",
    level: 2,
    question_no: 5,
    question_text: "ゼロトラストセキュリティモデルの基本原則として最も適切なものはどれか。",
    choices: [
      "内部ネットワークのすべてのユーザーは信頼できる",
      "すべてのユーザー、デバイス、アクセスを検証し、継続的に信頼を確認する",
      "パスワード認証があれば十分である",
      "外部からのアクセスだけを監視する"
    ],
    correct_index: 1,
    explanation: "ゼロトラストモデルは、内部・外部を問わず、すべてのアクセスを「信頼されていない」と仮定し、常に検証と監視を行う考え方です。"
  },
  {
    category: "ネットワークとセキュリティ",
    level: 2,
    question_no: 6,
    question_text: "WAF（Web Application Firewall）の主な検出対象として最も適切なものはどれか。",
    choices: [
      "OSレベルのパッチ適用状況",
      "SQLインジェクション、クロスサイトスクリプティングなどのアプリケーション層攻撃",
      "キーボードの操作速度",
      "メールの送受信内容"
    ],
    correct_index: 1,
    explanation: "WAFはアプリケーション層（OSI参照モデルの第7層）で動作し、SQLインジェクションやXSSなどのWeb攻撃を検出・防御します。"
  },
  {
    category: "ネットワークとセキュリティ",
    level: 2,
    question_no: 7,
    question_text: "ネットワークセグメンテーションの利点として最も適切なものはどれか。",
    choices: [
      "インターネット接続を高速化する",
      "ネットワークを複数のセグメントに分割し、セグメント間のアクセスを制御することで、被害の拡大を防ぐ",
      "すべてのウイルスを防止する",
      "パスワードの複雑性を低下させることができる"
    ],
    correct_index: 1,
    explanation: "ネットワークセグメンテーションにより、攻撃者が1つのセグメントに侵入しても、他のセグメントへのアクセスを制御できるため、被害の最小化が実現できます。"
  },
  {
    category: "ネットワークとセキュリティ",
    level: 2,
    question_no: 8,
    question_text: "IDS（侵入検知システム）とIPS（侵入防止システム）の主な違いは何か。",
    choices: [
      "IDSはウイルス定義ファイルを更新でき、IPSはできない",
      "IDSは検知のみで、IPSは検知と防御の両方を行う",
      "IPSはネットワークの外に配置され、IDSは内部に配置される",
      "IDSはWebトラフィックのみを監視し、IPSはすべてのトラフィックを監視する"
    ],
    correct_index: 1,
    explanation: "IDSは攻撃を検知してアラートを発するだけですが、IPSは検知した攻撃を自動的にブロックして防御を行います。"
  },
  {
    category: "ネットワークとセキュリティ",
    level: 2,
    question_no: 9,
    question_text: "OCSP（Online Certificate Status Protocol）の主な目的は何か。",
    choices: [
      "Webサーバーの通信を高速化する",
      "デジタル証明書の失効状態をリアルタイムで確認する",
      "ユーザーのパスワード強度を確認する",
      "ファイアウォールのルールを更新する"
    ],
    correct_index: 1,
    explanation: "OCSPは、デジタル証明書が失効していないかをリアルタイムで認証局に照会する仕組みで、CRLリストより効率的です。"
  },
  {
    category: "ネットワークとセキュリティ",
    level: 2,
    question_no: 10,
    question_text: "トランスポートレイヤーセキュリティと考えられるプロトコルは何か。",
    choices: [
      "HTTP、SMTP、FTP",
      "HTTPS、FTPS、TLS",
      "DNS、DHCP、ARP",
      "ICMP、IGMP、TCP"
    ],
    correct_index: 1,
    explanation: "HTTPS、FTPS、TLSはすべてトランスポートレイヤーでセキュリティ機能を提供し、通信の暗号化と認証を実現するプロトコルです。"
  },
  {
    category: "ネットワークとセキュリティ",
    level: 3,
    question_no: 2,
    question_text: "暗号スイートの強度評価において、最も脆弱な暗号化方式は何か。",
    choices: [
      "AES-256-GCM",
      "ChaCha20-Poly1305",
      "DES、MD5",
      "ECDHE-RSA"
    ],
    correct_index: 2,
    explanation: "DESは56ビットの短い鍵長で現在脆弱と考えられ、MD5はハッシュ衝突が可能です。これらは実装すべきではない旧式の方式です。"
  },
  {
    category: "ネットワークとセキュリティ",
    level: 3,
    question_no: 3,
    question_text: "Side-channel attack（サイドチャネル攻撃）に分類されるものはどれか。",
    choices: [
      "SQLインジェクション",
      "タイミング攻撃、電力分析",
      "フィッシング",
      "パスワード総当たり攻撃"
    ],
    correct_index: 1,
    explanation: "サイドチャネル攻撃は、実装の物理的特性（タイミング、電力消費、電磁波など）から情報を抽出する攻撃手法です。"
  },
  {
    category: "ネットワークとセキュリティ",
    level: 3,
    question_no: 4,
    question_text: "BGP（Border Gateway Protocol）セキュリティの脆弱性を対策する方法として最も効果的なものはどれか。",
    choices: [
      "より大きなサブネットマスクを使用する",
      "RPKI（Resource Public Key Infrastructure）の導入によるルート認証",
      "DNSの定期的な更新",
      "HTTPSをすべてのルータに適用する"
    ],
    correct_index: 1,
    explanation: "RPKIは、BGP経路アドバタイズメントの正当性を暗号学的に検証し、ルートハイジャック攻撃を防止する基盤です。"
  }
];
