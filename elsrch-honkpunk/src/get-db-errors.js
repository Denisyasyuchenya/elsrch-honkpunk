import { search } from "./search.js";

const searchRes = await search();

const result = searchRes.body.hits.hits.map((x) => JSON.parse(x._source.log));
