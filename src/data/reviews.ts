export const REVIEWS = [
  {
    id: '1',
    author: 'Laura Carter',
    rating: 5,
    body: "I'm so impressed with this card! It's beautifully made, and the holographic finish is incredible. My partner will absolutely love it.",
    date: '2025-02-14',
  },
  {
    id: '2',
    author: 'Andrew F.',
    rating: 5,
    body: "Tbh the pictures don't do it justice. The card looks incredible and feels like a real collectible.",
    date: '2025-02-13',
  },
  {
    id: '3',
    author: 'Sam',
    rating: 5,
    body: "Got this for my girlfriend, and she's obsessed with it. The holo shine is amazing, and the stand makes it feel so premium.",
    date: '2025-02-11',
  },
  {
    id: '4',
    author: 'Sam P.',
    rating: 5,
    body: "It came fast and it's amazing quality. The card looks just like a collectible! So glad I bought it.",
    date: '2025-02-11',
  },
  {
    id: '5',
    author: 'Cody B.',
    rating: 5,
    body: "If ur partner is into gaming this is literally perfect. It's shiny af and feels like a real collectible. So good!!",
    date: '2025-02-10',
  },
  {
    id: '6',
    author: 'Chris P.',
    rating: 5,
    body: "Came super well packaged. The card is so shiny and fun. My gf is gonna love it. Good idea for Vday honestly.",
    date: '2025-02-10',
  },
  {
    id: '7',
    author: 'Tina',
    rating: 5,
    body: "This is such a unique idea! The card came in perfect condition, and the stand is surprisingly sturdy.",
    date: '2025-02-09',
  },
  {
    id: '8',
    author: 'Rachel M.',
    rating: 5,
    body: "The holo design is SO pretty. My partner is gonna love this card for Valentine's. Way better than flowers imo.",
    date: '2025-02-09',
  },
  {
    id: '9',
    author: 'Lindsey H.',
    rating: 5,
    body: "My partner and I both love gaming, so this card was the perfect gift idea. Cant wait for Valentines now lol.",
    date: '2025-02-09',
  },
  {
    id: '10',
    author: 'Ryan Parker',
    rating: 5,
    body: "As a long-time trading card fan, this card is a dream come true. It's perfect for Valentine's Day and so well-crafted.",
    date: '2025-02-08',
  },
  {
    id: '11',
    author: 'Kelsey T.',
    rating: 5,
    body: "OMG this is SO GOOD. It's unique and looks amazing in person. Got it for my bf and now I want one for me lmao.",
    date: '2025-02-14',
  },
  {
    id: '12',
    author: 'Ryan',
    rating: 5,
    body: "I love how this card looks in the case. The stand is a bonus that makes it feel even more special!",
    date: '2025-02-11',
  },
  {
    id: '13',
    author: 'Tina L.',
    rating: 5,
    body: "The card is sooo shiny and just so different. I can't wait to give it to my bf. He's gonna love it!!",
    date: '2025-02-11',
  },
  {
    id: '14',
    author: 'Jason Brooks',
    rating: 5,
    body: "This card is such high quality and so unique! It's perfect for nostalgic card lovers, and I can't wait to gift it.",
    date: '2025-02-10',
  },
  {
    id: '15',
    author: 'Stephanie G.',
    rating: 5,
    body: "It looks even better in real life. The details are amazing, and the card feels really good quality. I love it so much!",
    date: '2025-02-10',
  },
  {
    id: '16',
    author: 'Emily Foster',
    rating: 5,
    body: "This card exceeded all my expectations. The design is beautiful, and it feels so premium. Worth every penny.",
    date: '2025-02-09',
  },
  {
    id: '17',
    author: 'Sophia',
    rating: 5,
    body: "My wife loves nostalgic collectibles, and this was the perfect surprise. The card and stand are amazing together!",
    date: '2025-02-09',
  },
  {
    id: '18',
    author: 'Eric S.',
    rating: 5,
    body: "This card is cute as hell. My gf will prob cry when she sees it. The holo effect is legit amazing!",
    date: '2025-02-09',
  },
  {
    id: '19',
    author: 'Evan J.',
    rating: 5,
    body: "If your partner loves nostalgic cards, just get this lol. It's creative, cute, and super well-made. Can't wait to gift it!",
    date: '2025-02-09',
  },
  {
    id: '20',
    author: 'Kate',
    rating: 5,
    body: "I was nervous buying this, but it turned out perfect. The card is beautiful, and the stand is sturdy and stylish.",
    date: '2025-02-08',
  },
] as const

export type Review = typeof REVIEWS[number]

export function getAverageRating(): number {
  const total = REVIEWS.reduce((sum, r) => sum + r.rating, 0)
  return Math.round((total / REVIEWS.length) * 100) / 100
}

export function getReviewCount(): number {
  return REVIEWS.length
}
