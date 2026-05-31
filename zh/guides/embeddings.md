
新的嵌入模型

`text-embedding-3-small` 和 `text-embedding-3-large`，我们最新且性能最强的嵌入模型，现已可用。它们具有更低的成本、更高的多语言性能，以及用于控制整体大小的新参数。

## 什么是嵌入？

OpenAI 的文本嵌入用于衡量文本字符串之间的相关性。嵌入通常用于：

*   **搜索**（根据与查询字符串的相关性对结果进行排序）
*   **聚类**（将相似的文本字符串分组）
*   **推荐**（推荐具有相关文本字符串的项目）
*   **异常检测**（识别相关性较低的异常值）
*   **多样性度量**（分析相似性分布）
*   **分类**（根据最相似的标签对文本字符串进行分类）

嵌入是一个浮点数向量（列表）。两个向量之间的[距离](#which-distance-function-should-i-use)衡量它们的相关性。距离小表示相关性高，距离大表示相关性低。

访问我们的[定价页面](https://openai.com/api/pricing/)了解嵌入定价。请求根据[输入]( https://developers.openai.com/api/reference/embeddings/create#embeddings/create-input)中的 [token](https://platform.openai.com/tokenizer) 数量计费。

## 如何获取嵌入

要获取嵌入，请将文本字符串发送到[嵌入 API 端点]( https://developers.openai.com/api/reference/embeddings)，并附上嵌入模型名称（例如 `text-embedding-3-small`）：

**示例：获取嵌入**

::: code-group
```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: "Your text string goes here",
  encoding_format: "float",
});

console.log(embedding);
```

::: code-group
```python
from openai import OpenAI
client = OpenAI()

response = client.embeddings.create(
    input="Your text string goes here",
    model="text-embedding-3-small"
)

print(response.data[0].embedding)
```

```curl
curl https://api.openai.com/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "input": "Your text string goes here",
    "model": "text-embedding-3-small"
  }'
```

:::

:::

响应包含嵌入向量（浮点数列表）以及一些额外的元数据。你可以提取嵌入向量，将其保存在向量数据库中，并用于许多不同的用例。

```
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [
        -0.006929283495992422, -0.005336422007530928, -4.547132266452536e-5,
        -0.024047505110502243
      ]
    }
  ],
  "model": "text-embedding-3-small",
  "usage": {
    "prompt_tokens": 5,
    "total_tokens": 5
  }
}
```

默认情况下，`text-embedding-3-small` 的嵌入向量长度为 `1536`，`text-embedding-3-large` 为 `3072`。要在不丢失其概念表示属性的情况下减少嵌入的维度，请传入 [dimensions 参数]( https://developers.openai.com/api/reference/embeddings/create#embeddings-create-dimensions)。在[嵌入用例部分](#use-cases)中查找有关嵌入维度的更多详细信息。

## 嵌入模型

OpenAI 提供两个强大的第三代嵌入模型（模型 ID 中以 `-3` 表示）。阅读嵌入 v3 [公告博客文章](https://openai.com/blog/new-embedding-models-and-api-updates)了解更多详情。

使用按输入 token 计费。以下是每美元可处理的文本页数示例（假设每页约 800 个 token）：

| 模型 | 每美元约页数 | 在 [MTEB](https://github.com/embeddings-benchmark/mteb) 评估上的性能 | 最大输入 |
| --- | --- | --- | --- |
| text-embedding-3-small | 62,500 | 62.3% | 8192 |
| text-embedding-3-large | 9,615 | 64.6% | 8192 |
| text-embedding-ada-002 | 12,500 | 61.0% | 8192 |

## 用例

这里我们展示一些代表性的用例，使用 [Amazon 精选食品评论数据集](https://www.kaggle.com/snap/amazon-fine-food-reviews)。

### 获取嵌入

该数据集包含截至 2012 年 10 月 Amazon 用户留下的共 568,454 条食品评论。我们使用最近 1000 条评论的子集进行说明。评论为英文，倾向于正面或负面。每条评论都有 `ProductId`、`UserId`、`Score`、评论标题（`Summary`）和评论正文（`Text`）。例如：

| Product Id | User Id | Score | Summary | Text |
| --- | --- | --- | --- | --- |
| B001E4KFG0 | A3SGXH7AUHU8GW | 5 | Good Quality Dog Food | I have bought several of the Vitality canned… |
| B00813GRG4 | A1D87F6ZCVE5NK | 1 | Not as Advertised | Product arrived labeled as Jumbo Salted Peanut… |

下面，我们将评论摘要和评论文本合并为一个组合文本。模型对这个组合文本进行编码并输出一个单一的嵌入向量。

Get\_embeddings\_from\_dataset.ipynb

```python
from openai import OpenAI
client = OpenAI()

def get_embedding(text, model="text-embedding-3-small"):
    text = text.replace("\n", " ")
    return client.embeddings.create(input = [text], model=model).data[0].embedding

df['ada_embedding'] = df.combined.apply(lambda x: get_embedding(x, model='text-embedding-3-small'))
df.to_csv('output/embedded_1k_reviews.csv', index=False)
```

要从保存的文件中加载数据，可以运行以下代码：

```
import pandas as pd

df = pd.read_csv('output/embedded_1k_reviews.csv')
df['ada_embedding'] = df.ada_embedding.apply(eval).apply(np.array)
```

减少嵌入维度

使用较大的嵌入，例如将它们存储在向量存储中用于检索，通常比使用较小的嵌入花费更多的计算、内存和存储成本。

我们的两个新嵌入模型都使用了一种[技术](https://arxiv.org/abs/2205.13147)进行训练，允许开发者在嵌入的性能和成本之间进行权衡。具体来说，开发者可以通过传入 [`dimensions` API 参数]( https://developers.openai.com/api/reference/embeddings/create#embeddings-create-dimensions)来缩短嵌入（即从序列末尾删除一些数字），而不会使嵌入失去其概念表示属性。例如，在 MTEB 基准测试中，`text-embedding-3-large` 嵌入可以缩短到 256 的大小，同时仍然优于大小为 1536 的未缩短的 `text-embedding-ada-002` 嵌入。你可以在我们的[嵌入 v3 发布博客文章](https://openai.com/blog/new-embedding-models-and-api-updates#:~:text=Native%20support%20for%20shortening%20embeddings)中阅读更多关于更改维度如何影响性能的信息。

通常，在创建嵌入时使用 `dimensions` 参数是建议的方法。在某些情况下，你可能需要在生成嵌入后更改嵌入维度。当你手动更改维度时，需要确保对嵌入的维度进行归一化，如下所示。

```python
from openai import OpenAI
import numpy as np

client = OpenAI()

def normalize_l2(x):
    x = np.array(x)
    if x.ndim == 1:
        norm = np.linalg.norm(x)
        if norm == 0:
            return x
        return x / norm
    else:
        norm = np.linalg.norm(x, 2, axis=1, keepdims=True)
        return np.where(norm == 0, x, x / norm)


response = client.embeddings.create(
    model="text-embedding-3-small", input="Testing 123", encoding_format="float"
)

cut_dim = response.data[0].embedding[:256]
norm_dim = normalize_l2(cut_dim)

print(norm_dim)
```

动态更改维度可以实现非常灵活的使用。例如，当使用仅支持最多 1024 维嵌入的向量数据存储时，开发者现在仍然可以使用我们最好的嵌入模型 `text-embedding-3-large`，并为 `dimensions` API 参数指定 1024 的值，这将把嵌入从 3072 维缩短，以较小的向量大小换取一些精度损失。

使用基于嵌入的搜索进行问答

[Question\_answering\_using\_embeddings.ipynb]( https://cdn.openai.com/API/docs/cookbook/examples/question_answering_using_embeddings)

在许多常见情况下，模型没有在包含关键事实和信息的数据上进行训练，而你希望在生成用户查询的响应时能够访问这些信息。解决此问题的一种方法（如下所示）是将额外信息放入模型的上下文窗口中。这在许多用例中是有效的，但会导致更高的 token 成本。在本笔记本中，我们探讨了这种方法与基于嵌入的搜索之间的权衡。

```python
query = f"""Use the below article on the 2022 Winter Olympics to answer the subsequent question. If the answer cannot be found, write "I don't know."

Article:
\"\"\"
{wikipedia_article_on_curling}
\"\"\"

Question: Which athletes won the gold medal in curling at the 2022 Winter Olympics?"""

response = client.chat.completions.create(
    messages=[
        {'role': 'system', 'content': 'You answer questions about the 2022 Winter Olympics.'},
        {'role': 'user', 'content': query},
    ],
    model=GPT_MODEL,
    temperature=0,
)

print(response.choices[0].message.content)
```

使用嵌入进行文本搜索

[Semantic\_text\_search\_using\_embeddings.ipynb]( https://cdn.openai.com/API/docs/cookbook/examples/semantic_text_search_using_embeddings)

为了检索最相关的文档，我们使用查询和每个文档的嵌入向量之间的余弦相似度，并返回得分最高的文档。

```python
from openai.embeddings_utils import get_embedding, cosine_similarity

def search_reviews(df, product_description, n=3, pprint=True):
    embedding = get_embedding(product_description, model='text-embedding-3-small')
    df['similarities'] = df.ada_embedding.apply(lambda x: cosine_similarity(x, embedding))
    res = df.sort_values('similarities', ascending=False).head(n)
    return res

res = search_reviews(df, 'delicious beans', n=3)
```

使用嵌入进行代码搜索

[Code\_search.ipynb]( https://cdn.openai.com/API/docs/cookbook/examples/code_search_using_embeddings)

代码搜索的工作方式与基于嵌入的文本搜索类似。我们提供了一种方法，从给定仓库中的所有 Python 文件中提取 Python 函数。然后使用 `text-embedding-3-small` 模型对每个函数进行索引。

要执行代码搜索，我们使用相同的模型将自然语言查询进行嵌入。然后计算生成的查询嵌入与每个函数嵌入之间的余弦相似度。余弦相似度最高的结果最为相关。

```python
from openai.embeddings_utils import get_embedding, cosine_similarity

df['code_embedding'] = df['code'].apply(lambda x: get_embedding(x, model='text-embedding-3-small'))

def search_functions(df, code_query, n=3, pprint=True, n_lines=7):
    embedding = get_embedding(code_query, model='text-embedding-3-small')
    df['similarities'] = df.code_embedding.apply(lambda x: cosine_similarity(x, embedding))

    res = df.sort_values('similarities', ascending=False).head(n)
    return res

res = search_functions(df, 'Completions API tests', n=3)
```

使用嵌入进行推荐

[Recommendation\_using\_embeddings.ipynb]( https://cdn.openai.com/API/docs/cookbook/examples/recommendation_using_embeddings)

因为嵌入向量之间的距离越短代表相似性越高，嵌入可以用于推荐。

下面，我们展示了一个基本的推荐器。它接收一个字符串列表和一个"源"字符串，计算它们的嵌入，然后返回字符串的排名，从最相似到最不相似。作为一个具体示例，下面链接的笔记本将此函数的一个版本应用于 [AG news 数据集](http://groups.di.unipi.it/~gulli/AG_corpus_of_news_articles.html)（缩减到 2,000 条新闻文章描述），以返回与任何给定源文章最相似的前 5 篇文章。

```python
def recommendations_from_strings(
    strings: List[str],
    index_of_source_string: int,
    model="text-embedding-3-small",
) -> List[int]:
    """Return nearest neighbors of a given string."""

    # get embeddings for all strings
    embeddings = [embedding_from_string(string, model=model) for string in strings]

    # get the embedding of the source string
    query_embedding = embeddings[index_of_source_string]

    # get distances between the source embedding and other embeddings (function from embeddings_utils.py)
    distances = distances_from_embeddings(query_embedding, embeddings, distance_metric="cosine")

    # get indices of nearest neighbors (function from embeddings_utils.py)
    indices_of_nearest_neighbors = indices_of_nearest_neighbors_from_distances(distances)
    return indices_of_nearest_neighbors
```

2D 数据可视化

[Visualizing\_embeddings\_in\_2D.ipynb]( https://cdn.openai.com/API/docs/cookbook/examples/visualizing_embeddings_in_2d)

嵌入的大小随底层模型的复杂性而变化。为了可视化这些高维数据，我们使用 t-SNE 算法将数据转换为二维。

我们根据评论者给出的星级评分对各个评论进行着色：

*   1 星：红色
*   2 星：深橙色
*   3 星：金色
*   4 星：青绿色
*   5 星：深绿色

![Amazon ratings visualized in language using t-SNE](https://cdn.openai.com/API/docs/images/embeddings-tsne.png)

可视化似乎产生了大约 3 个聚类，其中一个主要包含负面评论。

```
import pandas as pd
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt
import matplotlib

df = pd.read_csv('output/embedded_1k_reviews.csv')
matrix = df.ada_embedding.apply(eval).to_list()

# Create a t-SNE model and transform the data
tsne = TSNE(n_components=2, perplexity=15, random_state=42, init='random', learning_rate=200)
vis_dims = tsne.fit_transform(matrix)

colors = ["red", "darkorange", "gold", "turquiose", "darkgreen"]
x = [x for x,y in vis_dims]
y = [y for x,y in vis_dims]
color_indices = df.Score.values - 1

colormap = matplotlib.colors.ListedColormap(colors)
plt.scatter(x, y, c=color_indices, cmap=colormap, alpha=0.3)
plt.title("Amazon ratings visualized in language using t-SNE")
```

嵌入作为机器学习算法的文本特征编码器

[Regression\_using\_embeddings.ipynb]( https://cdn.openai.com/API/docs/cookbook/examples/regression_using_embeddings)

嵌入可以在机器学习模型中用作通用的自由文本特征编码器。如果某些相关输入是自由文本，那么加入嵌入将提高任何机器学习模型的性能。嵌入也可以在机器学习模型中用作分类特征编码器。当分类变量的名称有意义且数量众多时（如职位名称），这会增加最大的价值。相似性嵌入在此任务上通常比搜索嵌入表现更好。

我们观察到，通常嵌入表示非常丰富且信息密集。例如，使用 SVD 或 PCA 降低输入的维度，即使只降低 10%，通常也会导致特定任务的下游性能变差。

此代码将数据分为训练集和测试集，将用于以下两个用例，即回归和分类。

```
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    list(df.ada_embedding.values),
    df.Score,
    test_size = 0.2,
    random_state=42
)
```

#### 使用嵌入特征进行回归

嵌入提供了一种优雅的方式来预测数值。在此示例中，我们根据评论文本预测评论者的星级评分。由于嵌入中包含的语义信息很高，即使评论很少，预测也相当不错。

我们假设分数是 1 到 5 之间的连续变量，并允许算法预测任何浮点值。机器学习算法最小化预测值与真实分数之间的距离，实现了 0.39 的平均绝对误差，这意味着平均而言预测偏差不到半颗星。

```
from sklearn.ensemble import RandomForestRegressor

rfr = RandomForestRegressor(n_estimators=100)
rfr.fit(X_train, y_train)
preds = rfr.predict(X_test)
```

使用嵌入特征进行分类

[Classification\_using\_embeddings.ipynb]( https://cdn.openai.com/API/docs/cookbook/examples/classification_using_embeddings)

这次，我们不是让算法预测 1 到 5 之间的任意值，而是尝试将评论的确切星级数分类到 5 个桶中，范围从 1 到 5 星。

训练后，模型学会了比更细微的评论（2-4 星）更好地预测 1 星和 5 星评论，这可能是由于更极端的情感表达。

```
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

clf = RandomForestClassifier(n_estimators=100)
clf.fit(X_train, y_train)
preds = clf.predict(X_test)
```

零样本分类

[Zero-shot\_classification\_with\_embeddings.ipynb]( https://cdn.openai.com/API/docs/cookbook/examples/zero-shot_classification_with_embeddings)

我们可以使用嵌入进行零样本分类，无需任何标注的训练数据。对于每个类别，我们嵌入类别名称或类别的简短描述。要以零样本方式对某些新文本进行分类，我们将其嵌入与所有类别嵌入进行比较，并预测相似度最高的类别。

```python
from openai.embeddings_utils import cosine_similarity, get_embedding

df= df[df.Score!=3]
df['sentiment'] = df.Score.replace({1:'negative', 2:'negative', 4:'positive', 5:'positive'})

labels = ['negative', 'positive']
label_embeddings = [get_embedding(label, model=model) for label in labels]

def label_score(review_embedding, label_embeddings):
    return cosine_similarity(review_embedding, label_embeddings[1]) - cosine_similarity(review_embedding, label_embeddings[0])

prediction = 'positive' if label_score('Sample Review', label_embeddings) > 0 else 'negative'
```

获取用户和产品嵌入用于冷启动推荐

[User\_and\_product\_embeddings.ipynb]( https://cdn.openai.com/API/docs/cookbook/examples/user_and_product_embeddings)

我们可以通过对用户的所有评论取平均来获取用户嵌入。类似地，我们可以通过对关于该产品的所有评论取平均来获取产品嵌入。为了展示这种方法的实用性，我们使用 50k 条评论的子集，以覆盖每个用户和每个产品更多的评论。

我们在一个单独的测试集上评估这些嵌入的实用性，在该测试集中我们绘制了用户和产品嵌入的相似度作为评分的函数。有趣的是，基于这种方法，即使在用户收到产品之前，我们也可以比随机更好地预测他们是否会喜欢该产品。

![Boxplot grouped by Score](https://cdn.openai.com/API/docs/images/embeddings-boxplot.png)

```
user_embeddings = df.groupby('UserId').ada_embedding.apply(np.mean)
prod_embeddings = df.groupby('ProductId').ada_embedding.apply(np.mean)
```

聚类

[Clustering.ipynb]( https://cdn.openai.com/API/docs/cookbook/examples/clustering)

聚类是理解大量文本数据的一种方式。嵌入对此任务很有用，因为它们提供了每段文本的语义有意义的向量表示。因此，以无监督的方式，聚类将揭示数据集中隐藏的分组。

在此示例中，我们发现了四个不同的聚类：一个关注狗粮，一个关注负面评论，两个关注正面评论。

![Clusters identified visualized in language 2d using t-SNE](https://cdn.openai.com/API/docs/images/embeddings-cluster.png)

```
import numpy as np
from sklearn.cluster import KMeans

matrix = np.vstack(df.ada_embedding.values)
n_clusters = 4

kmeans = KMeans(n_clusters = n_clusters, init='k-means++', random_state=42)
kmeans.fit(matrix)
df['Cluster'] = kmeans.labels_
```

## 常见问题

### 在嵌入之前如何知道字符串有多少个 token？

在 Python 中，你可以使用 OpenAI 的分词器 [`tiktoken`](https://github.com/openai/tiktoken) 将字符串拆分为 token。

示例代码：

```python
import tiktoken

def num_tokens_from_string(string: str, encoding_name: str) -> int:
    """Returns the number of tokens in a text string."""
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens

num_tokens_from_string("tiktoken is great!", "cl100k_base")
```

对于第三代嵌入模型（如 `text-embedding-3-small`），请使用 `cl100k_base` 编码。

更多详细信息和示例代码请参阅 OpenAI Cookbook 指南[如何使用 tiktoken 计算 token]( https://cdn.openai.com/API/docs/cookbook/examples/how_to_count_tokens_with_tiktoken)。

### 如何快速检索 K 个最近的嵌入向量？

要快速搜索大量向量，我们建议使用向量数据库。你可以在我们 GitHub 上的 [Cookbook]( https://cdn.openai.com/API/docs/cookbook/examples/vector_databases/readme) 中找到使用向量数据库和 OpenAI API 的示例。

### 应该使用哪种距离函数？

我们推荐[余弦相似度](https://en.wikipedia.org/wiki/Cosine_similarity)。距离函数的选择通常影响不大。

OpenAI 嵌入被归一化为长度 1，这意味着：

*   余弦相似度可以仅使用点积来稍微更快地计算
*   余弦相似度和欧几里得距离将产生相同的排名

### 我可以在线分享我的嵌入吗？

可以，客户拥有我们模型的输入和输出，包括嵌入的情况。你有责任确保输入到我们 API 的内容不违反任何适用法律或我们的[使用条款](https://openai.com/policies/terms-of-use)。

### V3 嵌入模型了解最近的事件吗？

不了解，`text-embedding-3-large` 和 `text-embedding-3-small` 模型缺乏 2021 年 9 月之后发生的事件的知识。这通常不像文本生成模型那样是一个很大的限制，但在某些边缘情况下可能会降低性能。
