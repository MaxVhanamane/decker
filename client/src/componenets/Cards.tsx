import { FormEvent, useState } from "react";
import {useParams} from "react-router-dom";
import useGetCards from "../hooks/useGetCards";
import useCreateCard from "../hooks/useCreateCard";
import useDeleteCard from './../hooks/useDeleteCard';

function Cards() {
  const [content, setContent] = useState<string>("");
  const { deck_id } = useParams();
  const {data,isError,error,isLoading}=useGetCards( deck_id!)

   const {mutate:addCard,error:mutationError,isError:isMutationError}=useCreateCard()

   const {mutate:deleteCardItem,error:DeletemutationError,isError:isDeleteMutationError}=useDeleteCard()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload={deck_id:deck_id! ,content}
    addCard(payload)
    setContent("")
  };

  
  const handleDelete = async (index:number) => {
    const payload={deck_id:deck_id!,index}
    deleteCardItem(payload)
  };




  if(isLoading){
    return <h1>Fetching cards....</h1>
  }

  if (isError) {
    return <span>Error: {(error as Error).message}</span>
  }

  // if(isMutationError){
  //   return <p>Error{(mutationError as Error)?.message}</p>
  // }
console.log(data)
  return (
    <div className="flex flex-col gap-2 mt-6 w-screen h-screen ">
      <div className="w-full px-4 mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <label htmlFor="title" className=" flex justify-center items-center">
            Card details
          </label>
          <textarea
            className=" lg:w-96 w-80 border-2 border-gray-500 text-gray-900 px-2 rounded-md"
            id="title"
            rows={4}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setContent(e.target.value);
            }}
            value={content}
          />
          <button className="bg-yellow-400 px-2 text-white py-1 rounded-md ">Create Card</button>
        </form>
        <h1 className="font-bold text-xl text-gray-800 mb-6  mt-6">{data?.title} </h1>

      </div>
      <div className="mt-6  mx-6 mb-10">
        <ul className="flex flex-row flex-wrap gap-4 justify-center items-center">
          {data?.cards?.map((card,index) => {
            return (
              <li
                className="relative bg-gray-200  flex text-gray-800
                rounded-md w-fit p-4 py-6 h-fit text-center my-auto justify-center items-center break-all max-w-full"
                           key={index}
              >
               <button onClick={()=>{handleDelete(index)}} className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br outline-none  font-medium rounded-tr text-xs px-1  text-center  absolute top-0 right-0">X</button> {card}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default Cards;
