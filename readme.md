# Nopestradamus

Service for long term predictions.

## Mail setup

Here I describe how to fix so the mail the program sends are not always marked as spam (but mostly they will be, either way).

### SPF

SPF is some ancient security thing. It can be setup simply by adding stuff to the dns record.
For nopestradamus I added this to my DNS record, to allow mail from these IPs:
"v=spf1 ip4:138.197.184.62 ip4:93.188.3.35 include:nopestradamus.com -all"

### DKIM

DKIM is the modern cool thing, but messy to set up. I eventually just used this tool: https://dkimcore.org/tools/keys.html
But yeah, it feels a bit weird to generate private keys on some website...
Then I just added to private key to the privkey.pem file that is referenced in the project.
Then I added the following to a DNS record:
v=DKIM1;p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDOSKvTJpIe52Ow3ytinX5W1Mg7S10va8QY3wIhV5IY1x1woRbH+wM2Oa++3Cl60GPni7GJkIjnrusbgWTeEB3oy2q9bVbHqWfaDKsmrrdWr9QDAI+zJR1J2gwh9zowXYVC2yQFXW9UIjkB2oguFB2ZZ9c3jbbcz11//15tdqTRawIDAQAB

There is some weirdness about adding this DNS record. It belongs to the subdomain hej.\_domainkey.nopestradamus.com and when I send the mails I specify the keySelector 'hej'. I dont fully understand that. But whatever.

### validate mail setup

Finally, when you receive a mail in for example gmail you can click 'show origin' to see if SPF and DKIM was accepted.
This tool can be used to debug DKIM: https://www.dmarcanalyzer.com/dkim/dkim-check

### Program to send the mails

You need to install postfix. Check out the docker files for that stuff.

### Mail troubleshooting

`postqueue -j` is a nice command to check if the mails are not being sent.
When running locally you will most likely get `connection refused` errors. I believe this is ISPs blocking outgoing mails.

## Technical notes

The whole frontend should be rebuild without shitty mui/emotion crap.

The project is two processes: One nextjs project, and one node project which holds a cron job
