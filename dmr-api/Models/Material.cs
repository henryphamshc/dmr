﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMR_API.Models
{
    public class Material
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public ICollection<Glue> Glues { get; set; }
    }
}
