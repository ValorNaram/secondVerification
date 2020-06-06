# secondVerification

provides an additional security layer to the non-optional [HTTPS](https://en.wikipedia.org/wiki/HTTPS) security layer. It notifies the user if they are currently visiting an officially approved site by asking a verification service if the domain of that site is real. This way a user knows that the site they are visiting belongs to a domain of trust. This only works for connections to websites secured with HTTPS and the connections created by secondVerification will always require HTTPS explicitly.

**No system is 100% sure. Also secondVerification cannot guarantee that it cannot be fooled and also it cannot guarantee that the user cannot be fooled to think a particular message came from secondVerification. The user still remains the souvereign and responsible for taking the right actions depending on the information they have or not have.**

## Motive

Phishing gets more attractive to criminals due to the increasing usage of the [internet](https://en.wikipedia.org/wiki/Internet) (the [World Wide Web](https://en.wikipedia.org/wiki/World_Wide_Web) exspecially) as a fast and uncomplicated way of communication and exchange in the spheres of [e-government](https://en.wikipedia.org/wiki/E-government) and other sensitive areas of life like [Online-Banking](https://en.wikipedia.org/wiki/Online_banking).

Exspecially in times of [phishing](https://en.wikipedia.org/wiki/Phishing) of government sites to steal personal information of a victim believing that they are interacting with an official site this [application](https://en.wikipedia.org/wiki/Application_software) consisting of a [browser extension](https://en.wikipedia.org/wiki/Browser_extension) and a verification service (running on a server of an official authority) aims to make phishing more difficult.

### HTTPS is not enough

HTTPS ensures that the connection between a client and a server cannot be malformed by a [Man-In-The-Middle Attack](https://en.wikipedia.org/wiki/Man-in-the-middle_attack) or at least it makes it more difficult and theorectically a site supporting HTTPS can be seen as trusted sites. HTTPS connections need a certificate on the server side to verify that connection. In specified cases also a client needs a certificate.

Since HTTPS certificates can be obtained by everyone through [Let's Encrypt](https://letsencrypt.org/) which provides those certificates for free and is backed up by many sponsors and other certification authorities might not check if the certificates they are issueing might be used for illegal things, HTTPS certificates may only provide a better connection security but cannot be used to verify a trusted site. Phishing criminals can simply obtain a certificate from e.g. Let's Encrypt, buy a server and a domain and can start tricking victims into thinking that they were on an official site e.g. of their bank.

**secondVerification aims to show whever a site is really the site the user requested and not a malicious site looking the same or similiar. Making it harder for criminals.**

## Use Cases

- The user knows that sab.sachsen.de the real domain of _Saechsische Aufbaubank - Förderbank_ (secondVerification notifies that this site belongs to the list of trusted sites by turning its addressbar icon green).

- If the user visits sab-sachsen.de , then secondVerification won't report anything because this site hasn't been verified because it cannot be trusted and therefore not from an official authority. (secondVerification's addressbar icon changes to gray or stays grey).

- This initiative can be used to educate users of the world wide web on how to protect themselves by education campaigns on how to detect trusted sites also without the use of secondVerification. (Normal press fails to do so)
  
  - by popularity in press
  
  - by popularity in society
  
  - by popularity in communities
