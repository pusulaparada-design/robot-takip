const express = require("express");
const { google } = require("googleapis");
const app = express();

const SHEET_ID = "1aEfrG93LjByQR3JX0jEqUTej4ezd2DSDwNww6NDWXN8";

const auth = new google.auth.JWT(
  "sheets-writer@robot-takip.iam.gserviceaccount.com",
  null,
  "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDZOqC51ppKYDN8\ni3L3wyp2/bvo/qYoxMSoxicE5uzRFgxK6UtplBAkvGjpHRxP1TKbUefHVjg746Rb\nEFJNOMKjdJoemQ9ILyh4iOFfdoZA1oznuVik0P7dtdH2R3aMpc8TBatEpw8W0rcf\nfMv+h3Fo5eyaX0Fh1Ag44Ga4js0vRyMS3xY++u+iWBHzp0p0gZwZEU/Ny9IRtuUh\nRQvIgO94LWV2KfuIpwH4PBZJLu/ZGjd0ohfSPKM0yIwGFhaOnKnRt0GkNduQZE0q\n2QMFh4PettGaknJOz1LMgub6pBeSIBpCGA4PgR9xoDMdNrh5V+7G4QzclLniJjOD\nzck6OzUxAgMBAAECggEABJCT/mO76UfdPRxBuw10WnzEJ/DAoBxbv5TZDrl64ifo\nSTi0IiX/iC4XYZ1VfM36RW5IBGso56/wbQ4flJ+BOOXDM/+7uk9stnULO1zRFGgN\nx57K9eetu2NN5AgmExg24kDyaOZpIu3O9aVDNM2MJ2FRgqrxbkis2uPISiTiEJYQ\nWf52N1fhl58wlGm+6YmC+vIJY3skEdPNyl4632zIZjqy3sJfsu6WBAypH1bB+Top\npVSwcqtT4kWA6O+BophCSj43l5LP6+mk9uOWixiDaAmYxQmzao98EbEa5Q5jdi3X\nDeWodBdZEvVrv2kdSyXWc+nmMFquVzvO0PciHXQ6MwKBgQDyQH5Ifd4LE8rczLeh\nIXWOjjtqP//BnawLZozEx/COtZlTqUZt87Zj511xQfdT80ZGkCKBrYwXmsaLA3L1\niXPsiwJs0Ao38VyoaEyrpuAHHIeH77cHYxPrziUJ8wuxrBOD8TOeodK7Nr0b9GVX\nVhcXO8Q06ol0Fsy9IcdcT2tWuwKBgQDljpgo2FyiOZQz9KeZmF3nGi8HwRDlTU7d\nKtaIUDgs5RLTyIGQ/rBPQTrgJBVQ/MKFoslNNU5ytHyoKq5M1xQQrZBF23Ab8UYA\nTdTJ38ZIVBNwtcSfshgLOYJIElrtbhhBOkxf+/wvsL3X5UXc5BawPj6AWD7CM2ts\nI6NFDw8DAwKBgQCpwB19aI2GD5lwPRdTlmGMwgfKPQxXPMgIuRRc84mSRpgpMo2C\nkGs2+DHXIhVQQ0D0Qx2a5uQqyi7jzEfq3CVaFFJfsyvl5YA7FdLb2TRUZ15lF8mW\nKIwWCT6VCTUhi+Wk6Ah22QgUXZgIFapJl67Yfe3P8qTcrvlKcngDLDeX7wKBgQCJ\n/TxkGSMd9SSsUp3Iy3lu6SNqMtkYLW+BrTWGfUo3WoAFxJp18VNEYP6mK6qQo0+/\nCwqcmbWNaAcjA30A/ay3Fc4K4Ay1D0S3/BE0RIqpgbip4OnP4Ttoy+oPrtDvtmVo\nGEY+0HdYp5KGy/BCBu3IhbIGboVTMZuaRpXndlTcxwKBgQDnHxdmFpNdD2FGaQTP\nD+eMLmXozD5/2jLh7Xh9h5aHwpCXRKfBKqiVcs9U62lqKxd39MLMFaKRBAaof7/J\n6h4DvdKlnnMyiIJQt7RPjmuSvssvARxx71r4+pA7doWDMg69vlNbFIMMUe62OMf8\nq+jwsn3lrqrK5U8o7IFo4jpqaw==\n-----END PRIVATE KEY-----\n",
  ["https://www.googleapis.com/auth/spreadsheets"]
);

const sheets = google.sheets({ version: "v4", auth });

function parseMessage(text) {
  try {
    const idIsimMatch = text.match(/^(\d{5,})\s+(.+?)\s+(?:Varl|Varlık)/i);
    if (!idIsimMatch) return null;
    const id = idIsimMatch[1];
    const isim = idIsimMatch[2].trim();

    const varlikMatch   = text.match(/Varl[ıi]k[:\s]*([\d.,]+)/i);
    const toplamMatch   = text.match(/Toplam[:\s]*(-?[\d.,]+)%/i);
    const bugunTLMatch  = text.match(/Bug[üu]n[:\s]*(-?[\d.,]+)\s*[₺TL]/i);
    const bugunPctMatch = text.match(/Bug[üu]n\s*(?:Y[üu]zde|%)[:\s]*(-?[\d.,]+)%?/i)
                       || text.match(/Bug[üu]n[:\s]*-?[\d.,]+\s*[₺TL]\s+(-?[\d.,]+)%/i);
    const acikMatch     = text.match(/A[çc][ıi]k[:\s]*(\d+)/i);
    const kapaliMatch   = text.match(/Kapal[ıi][:\s]*(\d+)/i);
    const buyuklukMatch = text.match(/B[üu]y[üu]kl[üu]k[:\s]*([\d.,]+)/i);

    const parse = s => s ? parseFloat(s.replace(/\./g,"").replace(",",".")) : null;
    const varlik = parse(varlikMatch && varlikMatch[1]);
    if (!varlik) return null;

    const now = new Date();
    const pad = n => String(n).padStart(2,"0");
    const tarih = `${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()}`;
    const saat  = `${pad(now.getHours())}:00`;

    return {
      tarih, saat, id, isim, varlik,
      toplam:   parse(toplamMatch   && toplamMatch[1])   || 0,
      bugunTL:  parse(bugunTLMatch  && bugunTLMatch[1])  || 0,
      bugunPct: parse(bugunPctMatch && bugunPctMatch[1]) || 0,
      acik:     acikMatch   ? parseInt(acikMatch[1])   : 0,
      kapali:   kapaliMatch ? parseInt(kapaliMatch[1]) : 0,
      buyukluk: parse(buyuklukMatch && buyuklukMatch[1]) || 0
    };
  } catch(e) {
    return null;
  }
}

app.get("/", async (req, res) => {
  const text = req.query.text;
  if (!text) return res.json({ status: "error", message: "no text" });

  const parsed = parseMessage(text);
  if (!parsed) return res.json({ status: "error", message: "parse failed", text: text.substring(0,80) });

  try {
    // Ham Veri oku
    const getRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Ham Veri!A:D"
    });
    const rows = getRes.data.values || [];

    // ID var mı bak
    let hedefSatir = -1;
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][2]) === String(parsed.id)) {
        hedefSatir = i + 1; // 1-indexed
        break;
      }
    }

    const satir = [
      parsed.tarih, parsed.saat, parsed.id, parsed.isim,
      parsed.varlik, parsed.toplam, parsed.bugunTL, parsed.bugunPct,
      parsed.acik, parsed.kapali, parsed.buyukluk, 0, 0, ""
    ];

    if (hedefSatir > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Ham Veri!A${hedefSatir}`,
        valueInputOption: "RAW",
        requestBody: { values: [satir] }
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "Ham Veri!A:N",
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [satir] }
      });
    }

    res.json({ status: "ok", isim: parsed.isim, varlik: parsed.varlik });
  } catch(e) {
    res.json({ status: "error", message: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Sunucu çalışıyor: " + PORT));dosya a
