import type { CardDetail } from '../../../types/cards';
import Card from './card';

type Props = {
  cards: CardDetail[];
  showCardDetail: (cardId: string) => void;
};

const Cards = ({ cards, showCardDetail }: Props) => {
  return (
    <>
      {cards.map((card) => (
        <Card key={card.id} card={card} showCardDetail={showCardDetail} />
      ))}
    </>
  );
};

export default Cards;
