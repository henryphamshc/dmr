using DMR_API.DTO;
using DMR_API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMR_API._Services.Interface
{
   public interface IAbnormalService : IECService<Abnormal>
    {
        Task<object> AddRange(List<Abnormal> abnormals);
        Task<object> HasLock(string ingredient, string building, string batch);
        Task<object> GetBatchByIngredientID(int ingredientID);
        Task<object> GetBuildingByIngredientAndBatch(string ingredient, string batch);

    }
}
