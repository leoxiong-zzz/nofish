let memoize = {}

function levenshteinDistance(s1, s2) {
    if ([s1, s2] in memoize) return memoize[[s1, s2]]

    if (s1 === '') return s2.length
    if (s2 === '') return s1.length

    let distance
    if (s1[0] === s2[0]) distance = levenshteinDistance(s1.substr(1), s2.substr(1))
    else {
        let l1 = levenshteinDistance(s1, s2.substr(1))
        let l2 = levenshteinDistance(s1.substr(1), s2)
        let l3 = levenshteinDistance(s1.substr(1), s2.substr(1))
        distance = Math.min(l1, l2, l3) + 1
    }
    memoize[[s1, s2]] = distance
    return distance
}

const knownHosts = [
    'wikipedia.org',
    'wikimedia.org',
    'github.com',
    'gitlab.com',
    'google.com',
    'gmail.com',
    'youtube.com',
    'leoxiong.com',
    'leoxiong.dev',
    'console.cloud.google.com',
    'g.co'
].sort((a, b) => b.length - a.length)


chrome.webRequest.onBeforeRequest.addListener(function (details) {
    let potential = []

    for (let knownHost of knownHosts) {
        let dots = knownHost.split('.').length - 1
        let targetHost = new URL(details.url).hostname.split('.').slice(-(dots + 1)).join('.')

        if (knownHosts.includes(targetHost)) break
        let score = 1 - levenshteinDistance(targetHost, knownHost) / targetHost.length
        if (score > 0.8 && score !== 1) {
            console.log(`${targetHost} is potentially a phish of ${knownHost}, ${score} similar`)
            potential.push({
                targetHost: targetHost,
                knownHost: knownHost,
                score: score
            })
        }
    }
    memoize = {}

    if (potential.length) {
        return {cancel: true}
    }
}, {urls: ['*://*/*']}, ['blocking'])
