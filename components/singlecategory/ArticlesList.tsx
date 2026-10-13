import ArticleCard, { Article } from "./ArticleCard";

interface ArticlesListProps {
  articles: Article[];
}

const ArticlesList = ({ articles }: ArticlesListProps) => {
  return (
    <div className="space-y-[30px]">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};

export default ArticlesList;
